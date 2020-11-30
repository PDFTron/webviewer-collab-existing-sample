import { UserResolvers } from "@pdftron/collab-server";
import DB from "./db";

const sortListByFilters = <Entities extends any[]>(list: Entities, filters): Entities => {
  const { createdAfter, createdBefore, updatedAfter, updatedBefore, orderBy, orderDirection } = filters;
  const sorted = list.sort((item1, item2) => {
    if (!orderDirection || orderDirection === 'DESC') {
      return item2[orderBy] - item1[orderBy] // DESC
    } else {
      return item1[orderBy] - item2[orderBy] // ASC
    }
  });

  return sorted.filter(item => {
    if (createdAfter) {
      return item.createdAt > createdAfter
    }

    if (createdBefore) {
      return item.createdAt < createdBefore
    }

    if (updatedAfter) {
      return item.updatedAt > updatedAfter
    }

    if (updatedBefore) {
      return item.updatedAt < updatedBefore
    }
  }) as Entities;
}

export const generateResolvers = (db: DB): UserResolvers => {
  return {
    Query: {
      user: (id) => {
        const user = db.query((data) => {
            return data.users.find(user => user.id === id);
        });
        const { documents, ...rest } = user;
        return rest;
      },
      userWithEmail: (email) => {
        const user = db.query((data) => {
            return data.users.find(user => user.email === email);
        });
        const { documents, ...rest } = user;
        return rest;
      },
      documents: ({
        filters,
        ids,
        userId,
      }) => {
        const { limit } = filters;
        const documents = db.query((data) => {
          let filteredList = sortListByFilters(data.documents, filters)
          
          if (ids) {
            filteredList = filteredList.filter(item => {
              return ids.includes(item.id);
            })
          }

          if (userId) {
            filteredList = filteredList.filter(item => {
              return item.userId = userId;
            })
          }

          if (limit) {
            filteredList = filteredList.slice(0, limit);
          }

          return filteredList;
        });
        return documents;
      },
      annotations: ({
        ids,
        documentId,
        pageNumbers,
        inReplyTo,
        filters
      }) => {
        const { limit } = filters;

        const annotations = db.query((data) => {
          let filteredList = sortListByFilters(data.annotations, filters);

          if (ids) {
            filteredList = filteredList.filter(item => {
              return ids.includes(item.id);
            })
          }

          if (documentId) {
            filteredList = filteredList.filter(item => {
              return item.documentId === documentId
            })
          }

          if (pageNumbers) {
            filteredList = filteredList.filter(item => {
              return pageNumbers.includes(item.pageNumber);
            })
          }

          if (inReplyTo) {
            filteredList = filteredList.filter(item => {
              return item.inReplyTo === inReplyTo
            })
          }

          if (limit) {
            filteredList = filteredList.slice(0, limit);
          }

          return filteredList;
        });

        return annotations;
      },
      annotationMembers: ({
        ids,
        annotationId,
        userId,
        filters
      }) => {
        const { limit } = filters;
        const annotationMembers = db.query((data) => {
          let filteredList = sortListByFilters(data.annotationMembers, filters);

          if (ids) {
            filteredList = filteredList.filter(item => {
              return ids.includes(item.id);
            })
          }

          if (annotationId) {
            filteredList = filteredList.filter(item => {
              return item.annotationId === annotationId
            })
          }

          if (userId) {
            filteredList = filteredList.filter(item => {
              return item.userId === userId
            })
          }

          if (limit) {
            filteredList = filteredList.slice(0, limit);
          }

          return filteredList
        });
        return annotationMembers;
      },
      documentMembers: ({
        ids,
        documentId,
        userId,
        filters
      }) => {
        const { limit } = filters;
        const documentMembers = db.query((data) => {
          let filteredList = sortListByFilters(data.documentMembers, filters);

          if (ids) {
            filteredList = filteredList.filter(item => {
              return ids.includes(item.id);
            })
          }

          if (documentId) {
            filteredList = filteredList.filter(item => {
              return item.documentId === documentId
            })
          }

          if (userId) {
            filteredList = filteredList.filter(item => {
              return item.userId === userId
            })
          }

          if (limit) {
            filteredList = filteredList.slice(0, limit);
          }

          return filteredList
        });
        return documentMembers;
      },
      annotationCount: ({
        documentId,
        since
      }) => {
        const annotList = db.query(data => {
          const annots = data.annotations;
          return annots.filter((annot) => {
            return annot.documentId === documentId && annot.createdAt > since
          });
        })
        return annotList.length;
      },
      annotationMemberCount: ({
        documentId,
        userId,
        since
      }) => {
        const annotMemberList = db.query(data => {
          const members = data.annotationMembers;
          return members.filter((annotMember) => {
            return annotMember.documentId === documentId && annotMember.userId === userId && annotMember.createdAt > since
          });
        })
        return annotMemberList.length;
      }
    },
    Mutation: {
      addUser: async (user) => {
        let newUser;;
          await db.write((data, getId) => {
              newUser = {
                ...user,
                id: user.id || getId()
              };
              data.users.push(newUser);
              return data;
          });
        return newUser;
      },
      addAnnotation: async (annotation) => {
        let newAnnotation;
          await db.write((data, getId) => {
              newAnnotation = {
                ...annotation,
                id: annotation.id || getId()
              }
              data.annotations.push(newAnnotation);
              return data;
          });
        return newAnnotation;
      },
      editAnnotation: async (id, input) => {
        let annotation;
        await db.write((data) => {
          const index = data.annotations.findIndex(annot => annot.id === id);
          if( index !== -1) {
            annotation = {
              ...data.annotations[index],
              ...input
            };
            data.annotations[index] = annotation;
          }
          return data;
        });
        return annotation;
      },
      deleteAnnotation: async (id) => {
        let result;
        await db.write((data) => {
          const index = data.annotations.findIndex(annot => annot.id === id);
          if(index === -1) {
            result = {
              successful: false
            }
          } else {
            data.annotations.splice(index, 1);
            result = {
              successful: true
            }
          }
          return data;
        });
        return result;
      },
      addDocument: async (document) => {
        let newDocument;
          await db.write((data, getId) => {
            const index = data.documents.findIndex(doc => doc.id === document.id);
            if(index !== -1) {
              throw new Error(`Document with id ${document.id} already exists.`)
          } else {
            newDocument= {
              ...document,
                id: document.id || getId()
              } 
              data.documents.push(newDocument);
          }                
          return data;
        });
        const { members, annotations, ...doc } = newDocument;
        return doc;
      },
      editDocument: async (id, input) => {
        let document;
        await db.write((data) => {
          const index = data.documents.findIndex(doc => doc.id === id);
          if(index !== -1) {
            document = {
              ...data.documents[index],
              ...input
            };
            data.documents[index] = document;
          }     
          return data;
        });
        return document;
      },
      deleteDocument: async (id) => {
        let result;
        await db.write((data) => {
          const index = data.documents.findIndex(doc => doc.id === id);
          if(index === -1) {
            result = {
              successful: false
            }
          } else {
            data.documents.splice(index, 1);
            result = {
              successful: true
            }
          }
          return data;
        });
        return result;
      },
    addDocumentMember: async (documentMember) => {
        const { user, ...member } = documentMember;
        let newDocumentMember;
        await db.write((data, getId) => {
          const existingMember = data.documentMembers.find(m => 
            m.documentId === member.documentId &&
            m.userId === member.userId);
          if(!existingMember) {
            newDocumentMember = {
                ...member,
                id: getId()
              }
              data.documentMembers.push(newDocumentMember);
            }
          return data;
        });

        return newDocumentMember;
      },
      editDocumentMember: async (id, input) => {
        let documentMember;
        await await db.write((data) => {
          const index = data.documentMembers.findIndex(mem => mem.id === id);
          documentMember = {
            ...data.documentMembers[index],
            ...input
          };
          data.documentMembers[index] = documentMember;
          return data;
        });
        return documentMember;
      },
      deleteDocumentMember: async (id) => {
        let result;
        await db.write((data) => {
          const index = data.documentMembers.findIndex(mem => mem.id === id);
          if(index === -1) {
            result = {
              successful: false
            }
          } else {
            data.documentMembers.splice(index, 1);
            result = {
              successful: true
            }
          }
          return data;
        });
        return result;
      },
      addAnnotationMember: async (annotationMember) => {
        const { user, ...member } = annotationMember;
        let newAnnotationMember;
          await db.write((data, getId) => {
              newAnnotationMember = {
                ...member,
                id: getId()
              }
              data.annotationMembers.push(newAnnotationMember);
              return data;
          });
        return newAnnotationMember;
      },
      editAnnotationMember: async (id, input) => {
        let annotationMember;
        await db.write((data) => {
          const index = data.annotationMembers.findIndex(mem => mem.id === id);
          annotationMember = {
            ...data.annotationMembers[index],
            ...input
          };
          data.annotationMembers[index] = annotationMember;
          return data;
        });
        return annotationMember;
      },
      deleteAnnotationMember: async (id) => {
        let result;
        await db.write((data) => {
          const index = data.annotationMembers.findIndex(mem => mem.id === id);
          if(index === -1) {
            result = {
              successful: false
            }
          } else {
            data.annotationMembers.splice(index, 1);
            result = {
              successful: true
            }
          }
          return data;
        });
        return result;
      }
    }
  }
}

