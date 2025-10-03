import CreateCompany from "@/component/adminPanel/createCompany";
import RegistrationRequests from "@/component/adminPanel/getAllMailList";
import TokenUpdate from "@/component/adminPanel/tokenUpdate";
import { Divider } from "@mui/material";
export default function AdminPage() {
  return (
    <div>
      <h1>Admin Page</h1>
      <RegistrationRequests />
      <Divider sx={{ mt: 5, mb: 15 }} />
      <CreateCompany />
      <Divider sx={{ mt: 5, mb: 5 }} />
      <TokenUpdate />
    </div>
  );
}
