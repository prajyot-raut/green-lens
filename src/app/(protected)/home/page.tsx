import AuthChecker from "@/components/AuthChecker";

function ProtectedPage() {
  return (
    <AuthChecker>
      <div>
        <h1>Protected Page</h1>
        <p>This page requires authentication.</p>
      </div>
    </AuthChecker>
  );
}

export default ProtectedPage;
