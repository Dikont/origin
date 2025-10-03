import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { TeamMemberCard } from "@/ui/Card/CustomCard";

type UserCardProps = {
  avatarSrc?: string;
  name: string;
  target: string;
};

export default function UserCard({ avatarSrc, name, target }: UserCardProps) {
  return (
    <TeamMemberCard
      sx={{
        border: "2px solid transparent",
        "&:hover": { borderColor: "#1976d2" },
      }}
    >
      <Box
        sx={{
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40px",
          background: "#f4f4f4",
          borderTopRightRadius: "15px",
          WebkitBorderTopLeftRadius: "15px",
        }}
      >
        <Avatar
          alt="Remy Sharp"
          src={avatarSrc || `https://picsum.photos/200/300/?blur`}
          sx={{ width: 100, height: 100 }}
        />
      </Box>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">{name}</Typography>
        <Typography variant="h6">{target}</Typography>
        <IconButton>
          <LinkedInIcon sx={{ fontSize: "22px", color: "blue" }} />
        </IconButton>
      </CardContent>
    </TeamMemberCard>
  );
}
