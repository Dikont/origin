import { CustomCard, TeamMemberCard } from "@/ui/Card/CustomCard";
import { Box, Grid, List, ListItem, Typography } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RecyclingIcon from "@mui/icons-material/Recycling";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import UserCard from "@/component/UserCard/UserCard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Hakkımızda - Dikont Dijital Kontrat Platformu",
  description:
    "Dikont, dijital kontrat yönetimi ve imzalama alanında yapay zeka destekli çözümler sunar. Misyonumuz, iş süreçlerini dijitalleştirerek zaman ve maliyet tasarrufu sağlamaktır.",
  keywords: [
    "dikont hakkında",
    "dikont nedir",
    "dijital kontrat şirketi",
    "kontrat yönetimi",
    "yapay zeka belgeler",
    "hakkımızda",
    "dijital imza şirketi",
    "çevre dostu dijital çözümler",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/about",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/about",
      "en-US": "https://www.dikont.com/en/about",
      "nl-NL": "https://www.dikont.com/nl/about",
    },
  },
};

export default async function Index() {
  const t = await getTranslations("about");

  const teamInfo = [
    {
      name: "Can Tolga Deniz",
      target: t("team_member_role_founder_seo"),
      avatarSrc: "https://picsum.photos/200/300?grayscale",
      url: "https://www.linkedin.com/in/can-tolga-deniz/",
    },
  ];

  return (
    <Grid container rowSpacing={3} columnSpacing={3} sx={{ pb: 4 }}>
      {/* Hero/About */}

      <Grid size={{ xs: 12, md: 6, lg: 4 }} display={"flex"}>
        <CustomCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <ApartmentIcon sx={{ fontSize: 30, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("about_title")}
            </Typography>
            <Typography variant="subtitle2">{t("about_text")}</Typography>
          </Box>
        </CustomCard>
      </Grid>

      {/* Mission / Vision */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }} display={"flex"}>
        <CustomCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <TipsAndUpdatesIcon sx={{ fontSize: 30, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("mission_title")}
            </Typography>
            <Typography variant="subtitle2">{t("mission_text")}</Typography>
          </Box>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }} display={"flex"}>
        <CustomCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <VisibilityIcon sx={{ fontSize: 30, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("vision_title")}
            </Typography>
            <Typography variant="subtitle2">{t("vision_text")}</Typography>
          </Box>
        </CustomCard>
      </Grid>

      {/* Why Dikont */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 24 }}>{t("why_title")}</Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <SecurityIcon sx={{ fontSize: 40, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("secure_title")}
            </Typography>
            <Typography variant="subtitle2">{t("secure_text")}</Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <SpeedIcon sx={{ fontSize: 40, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("fast_title")}
            </Typography>
            <Typography variant="subtitle2">{t("fast_text")}</Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <RecyclingIcon sx={{ fontSize: 40, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("eco_title")}
            </Typography>
            <Typography variant="subtitle2">{t("eco_text")}</Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      {/* Numbers */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 24 }}>{t("numbers_title")}</Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <PeopleIcon sx={{ fontSize: 44, color: "blue" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "blue", fontSize: 24, fontWeight: "bold" }}
            >
              1000+
            </Typography>
            <Typography variant="subtitle2">
              {t("numbers_active_users")}
            </Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <PeopleIcon sx={{ fontSize: 44, color: "blue" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "blue", fontSize: 24, fontWeight: "bold" }}
            >
              5000+
            </Typography>
            <Typography variant="subtitle2">
              {t("numbers_signed_contracts")}
            </Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 44, color: "blue" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "blue", fontSize: 24, fontWeight: "bold" }}
            >
              100+
            </Typography>
            <Typography variant="subtitle2">
              {t("numbers_corporate_customers")}
            </Typography>
          </Box>
        </TeamMemberCard>
      </Grid>

      {/* Technologies */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 24 }}>
            {t("technologies_title")}
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "blue" }}>
              {t("ai_title")}
            </Typography>
            <List>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("ai_item_openai_gpt4")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("ai_item_tensorflow")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("ai_item_pytorch")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">{t("ai_item_nlp")}</Typography>
              </ListItem>
            </List>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "blue" }}>
              {t("security_title")}
            </Typography>
            <List>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("security_item_blockchain")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("security_item_eimza")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("security_item_ssltls")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("security_item_encryption")}
                </Typography>
              </ListItem>
            </List>
          </Box>
        </TeamMemberCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TeamMemberCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "blue" }}>
              {t("infrastructure_title")}
            </Typography>
            <List>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("infra_item_aws")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("infra_item_docker")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("infra_item_kubernetes")}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="subtitle2">
                  {t("infra_item_mongodb")}
                </Typography>
              </ListItem>
            </List>
          </Box>
        </TeamMemberCard>
      </Grid>

      {/* Partners & Certificates */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 24 }}>{t("partners_title")}</Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomCard
          sx={{
            border: "2px solid transparent",
            "&:hover": { borderColor: "#1976d2" },
          }}
          display={"flex"}
          justifyContent={"center"}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <ApartmentIcon sx={{ fontSize: 30, color: "blue" }} />
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              {t("partners_text")}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
                width: "100%",
                mt: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <MilitaryTechIcon
                  sx={{ fontSize: 55, color: "blue", mb: 2, mt: 1 }}
                />
                <Typography variant="subtitle1">
                  {t("badge_iso_27001")}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <MilitaryTechIcon
                  sx={{ fontSize: 55, color: "blue", mb: 2, mt: 1 }}
                />
                <Typography variant="subtitle1">
                  {t("badge_iso_9001")}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <MilitaryTechIcon
                  sx={{ fontSize: 55, color: "blue", mb: 2, mt: 1 }}
                />
                <Typography variant="subtitle1">{t("badge_kvkk")}</Typography>
              </Box>
            </Box>
          </Box>
        </CustomCard>
      </Grid>

      {/* Team */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 24 }}>{t("team_title")}</Typography>
        </Box>
      </Grid>

      <Box
        gap={2}
        display={"flex"}
        justifyContent={"center"}
        width={"100%"}
        flexDirection={{ xs: "column", md: "row" }}
      >
        {teamInfo.map((item, key) => (
          <Box
            key={key}
            sx={{ display: "flex", justifyContent: "center" }}
            component={"a"}
            href={item.url}
            target="_blank"
            textAlign={"center"}
          >
            <UserCard
              avatarSrc={item.avatarSrc}
              name={item.name}
              target={item.target}
            />
          </Box>
        ))}
      </Box>
    </Grid>
  );
}
