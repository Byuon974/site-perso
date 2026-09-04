<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="rss/channel/title"/> — Flux RSS</title>
        <style>
          :root {
            --color-ivory-mist: #f8f4e3;
            --color-dust-grey: #d4cdc3;
            --color-ash-grey: #a2a392;
            --color-grey-olive: #9a998c;
            --text-dark: #1e1e1e;
          }
          
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background: var(--color-ivory-mist);
            color: var(--text-dark);
            padding: 2rem;
          }
          
          .container {
            max-width: 700px;
            margin: 0 auto;
          }
          
          header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--color-dust-grey);
          }
          
          .rss-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #f26522;
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
          }
          
          .rss-badge svg {
            width: 14px;
            height: 14px;
          }
          
          h1 {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .description {
            color: var(--color-grey-olive);
            font-size: 0.95rem;
          }
          
          .subscribe-info {
            background: var(--color-dust-grey);
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 2rem;
            font-size: 0.85rem;
          }
          
          .subscribe-info strong {
            display: block;
            margin-bottom: 0.3rem;
          }
          
          .feed-url {
            font-family: monospace;
            background: rgba(0,0,0,0.05);
            padding: 0.3rem 0.5rem;
            border-radius: 3px;
            word-break: break-all;
            display: inline-block;
            margin-top: 0.5rem;
          }
          
          h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--color-grey-olive);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .items {
            list-style: none;
          }
          
          .item {
            padding: 1.2rem 0;
            border-bottom: 1px solid var(--color-dust-grey);
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.3rem;
          }
          
          .item-title a {
            color: inherit;
            text-decoration: none;
          }
          
          .item-title a:hover {
            color: var(--color-grey-olive);
          }
          
          .item-date {
            font-size: 0.8rem;
            color: var(--color-ash-grey);
            margin-bottom: 0.5rem;
          }
          
          .item-description {
            font-size: 0.9rem;
            color: var(--color-grey-olive);
            line-height: 1.5;
          }
          
          footer {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--color-dust-grey);
            text-align: center;
            font-size: 0.8rem;
            color: var(--color-ash-grey);
          }
          
          footer a {
            color: var(--color-grey-olive);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div class="rss-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
              </svg>
              Flux RSS
            </div>
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="rss/channel/description"/></p>
          </header>
          
          <div class="subscribe-info">
            <strong>📡 S'abonner à ce flux</strong>
            Copiez l'URL ci-dessous dans votre lecteur RSS favori (Feedly, Inoreader, NetNewsWire...) :
            <div class="feed-url"><xsl:value-of select="rss/channel/link"/>/index.xml</div>
          </div>
          
          <h2>Articles récents</h2>
          
          <ul class="items">
            <xsl:for-each select="rss/channel/item">
              <li class="item">
                <h3 class="item-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <div class="item-date">
                  <xsl:value-of select="pubDate"/>
                </div>
                <xsl:if test="description">
                  <p class="item-description">
                    <xsl:value-of select="description"/>
                  </p>
                </xsl:if>
              </li>
            </xsl:for-each>
          </ul>
          
          <footer>
            <a>
              <xsl:attribute name="href">
                <xsl:value-of select="rss/channel/link"/>
              </xsl:attribute>
              ← Retour au site
            </a>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
