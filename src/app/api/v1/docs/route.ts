import { NextResponse } from "next/server";

/**
 * GET /api/v1/docs
 * Rend la page HTML interactive Swagger UI pour tester et explorer les APIs de la plateforme.
 */
export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Documentation API - Bitcoin Blood</title>
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -inherit;
      }
      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        background: #fafafa;
      }
      /* Personnalisation premium pour correspondre à la marque Bitcoin Blood */
      .swagger-ui .topbar {
        background-color: #8c0000;
        border-bottom: 3px solid #ff9900;
      }
      .swagger-ui .info .title {
        color: #333;
        font-family: 'Outfit', sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" charset="UTF-8"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/v1/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "BaseLayout",
          defaultModelsExpandDepth: -1
        });
      };
    </script>
  </body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
