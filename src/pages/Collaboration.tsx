
const CollaborationPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Collaboration & Team Features</h1>
        <h2 className="text-2xl font-bold mb-2">Team Collaboration</h2>
        <p className="mb-4">Set the tone for collaboration with a personal message that explains why you're sharing your survey and how others can best contribute.</p>
        <h2 className="text-2xl font-bold mb-2">@Mentions</h2>
        <p className="mb-4">Simplify collaboration by using "@" to tag teammates so you can get targeted feedback on your survey, annotate results dashboards, and share insights.</p>
        <h2 className="text-2xl font-bold mb-2">Permission Controls</h2>
        <p className="mb-4">Manage access levels for different team members.</p>
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p>Centralized management for enterprise accounts.</p>
      </div>
    </Layout>
  );
};

export default CollaborationPage;

