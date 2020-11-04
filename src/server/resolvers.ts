import DB from "./db";

export const generateResolvers = (db: DB) => {
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
            annotation: (id) => {
                const annotation = db.query((data) => {
                    return data.annotations.find(annotation => annotation.id === id);
                });
                const { author, membership, ...rest } = annotation;
                return rest;
            },
            document: (id) => {
                const document = db.query((data) => {
                    return data.documents.find(document => document.id === id);
                });
                const transform =  {
                  ...document,
                  authorId: document.authorId || document.userId
                };
                const { members, annotations, ...rest } = transform;
                return rest
            },
            userDocuments: (userId) => {
                const documents = db.query((data) => {
                  if(data.documentMembers) {
                    const members = data.documentMembers.filter(documentMember => documentMember.userId === userId);
                    return members.map(member => data.documents.find(document => document.id === member.documentId));
                  } else {
                    return [];
                  }
                });
                return documents.map( doc => {
                  const { members, annotations, ...rest } = doc;
                  return rest;
                });
            },
            annotations: (documentId) => {
                const annotations = db.query((data) => {
                    return data.annotations.filter(annotation => annotation.documentId === documentId);
                });
                return annotations.map(annotation => {
                  const { author, membership, ...rest } = annotation;
                  return rest;
                });
            },
            annotationMember: (annotationId, userId, memberId) => {
                const annotationMember = db.query((data) => {
                    if(memberId) {
                        return data.annotationMembers.find(annotationMember => annotationMember.id === memberId);
                    } else {
                        return data.annotationMembers.find(annotationMember => 
                            annotationMember.annotationId === annotationId &&
                            annotationMember.userId === userId);
                    }
                });
                return annotationMember;
            },
            documentMember: (documentId, userId, memberId) => {
              const documentMember = db.query((data) => {
                if(memberId){
                  return data.documentMembers.find(documentMember => documentMember.id === memberId);
                } else {
                  return data.documentMembers.find(documentMember => 
                      documentMember.documentId === documentId &&
                      documentMember.userId === userId);
                }
              });
              if (!documentMember) return null;
              const { user, ...rest } = documentMember;
              return rest;
            },
            annotationMembers: (annotationId) => {
                const annotationMembers = db.query((data) => {
                    return data.annotationMembers.filter(annotationMember => annotationMember.annotationId === annotationId);
                });
                return annotationMembers.map( m => {
                  const { user, ...rest } = m;
                  return rest;
                });
            },
            documentMembers: (documentId) => {
                const documentMembers = db.query((data) => {
                    return data.documentMembers.filter(documentMember => documentMember.documentId === documentId);
                });
                return documentMembers.map( m => {
                  const { user, ...rest } = m;
                  return rest;
                });;
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
              const { author, membership, ...annot } = annotation;
              let newAnnotation;
                await db.write((data, getId) => {
                    newAnnotation = {
                      ...annot,
                      id: annot.id || getId()
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

