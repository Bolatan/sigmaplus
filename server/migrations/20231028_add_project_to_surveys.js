export const up = async (db, client) => {
  await db.collection('surveys').updateMany({}, { $set: { projectId: null } });
};

export const down = async (db, client) => {
  await db.collection('surveys').updateMany({}, { $unset: { projectId: "" } });
};
