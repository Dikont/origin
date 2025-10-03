export default function GET() {
  const html = `
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dikont İmza Daveti</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f7ff;
      font-family: Arial, sans-serif;
    "
  >
    <table
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 8px;
      "
    >
      <tr>
        <td style="padding: 30px 40px 20px 40px; text-align: center">
          <img
            src="/Dikont-Logo.svg"
            alt="Dikont Logo"
            style="max-width: 150px"
          />
        </td>
      </tr>

      <tr>
        <td style="padding: 0 40px 20px 40px; text-align: center">
          <h2 style="color: #000">
            Merhaba
            <a
              href="mailto:[signer]"
              style="color: #2f5bea; text-decoration: underline"
              >[signer]</a
            >,
          </h2>
          <p style="margin: 16px 0; color: #555">Alan açıklaması</p>
          <p style="margin: 16px 0; color: #555">
            Aşağıdaki imza için gerekli kodu bulabilirsiniz:
          </p>
        </td>
      </tr>

      <tr>
        <td style="text-align: center; padding-bottom: 20px">
          <a
            href="#"
            style="
              background-color: #5f4dee;
              color: #fff;
              padding: 14px 28px;
              border-radius: 6px;
              font-weight: bold;
              text-decoration: none;
              font-size: 16px;
            "
            >[code]</a
          >
        </td>
      </tr>

      

      <tr>
        <td
          style="
            padding: 30px 40px 0px 40px;
            font-size: 12px;
            color: #888;
            text-align: center;
          "
        >
          Herhangi bir sorunuz var ise bize
          <a href="mailto:info@dikont.com" style="color: #2f5bea"
            >info@dikont.com</a
          >
          üzerinden ulaşabilirsiniz. Tüm hakları saklıdır.
        </td>
      </tr>

      <tr>
        <td
          style="
            padding: 10px 40px 20px 40px;
            font-size: 12px;
            color: #888;
            text-align: center;
          "
        >
          Fulya, Yeşilçimen Sokağı Polat Tower Residence Bağımsız Bölüm 12/430,
          34394 Şişli/İstanbul
        </td>
      </tr>

      <tr>
        <td
          style="
            padding: 10px 40px 30px 40px;
            font-size: 12px;
            text-align: center;
          "
        >
          <a href="#" style="color: #2f5bea; margin-right: 10px"
            >Terms of Use</a
          >
          |
          <a href="#" style="color: #2f5bea; margin-left: 10px"
            >Privacy Policy</a
          >
        </td>
      </tr>
    </table>
  </body>
</html>

  `;

  return (
    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{html}</pre>
  );
}
