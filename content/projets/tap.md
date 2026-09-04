---
title: "TAP"
description: "Plateforme SaaS de régulation transport médico-social pour les sociétés de taxis conventionnés CGSS à La Réunion."
date: 2026-07-14
image: "/images/uploads/tap-dashboard.png"
tags: ["Next.js", "TypeScript", "Supabase", "Sécurité", "RGPD"]
draft: false
---

## Le projet en une phrase

TAP est une plateforme de régulation de transport pour les sociétés de taxis conventionnés CGSS à La Réunion.

TAP remplace des tableaux Excel et une gestion papier par un outil web qui aide une régulatrice à organiser les trajets médicaux de ses patients, à suivre la facturation et à rester conforme à la réglementation sur les données de santé. Le projet est aujourd'hui fonctionnel et sécurisé ; sa mise en production dépend d'une décision commerciale de l'entreprise, pas d'un point technique restant à finir.

Un même fait commande tout ce qui suit : j'ai porté ce projet comme unique informaticien du service. Chaque arbitrage d'architecture, chaque politique de sécurité, chaque renoncement de périmètre m'est revenu. J'ai tranché, puis j'ai écrit mes décisions pour qu'elles tiennent au-delà de ma mémoire et qu'un successeur puisse reprendre sans moi.

---

## Ce qui a motivé TAP

À La Réunion, les sociétés de transport conventionnées CGSS assurent des trajets médico-sociaux pour des milliers de patients, et ce quotidien s'accompagne de contraintes fortes. Une régulatrice y passe 8 heures par jour, 220 jours par an, à gérer les appels, les affectations et les tournées, sur un terrain qui ne pardonne rien : routes sinueuses, temps de trajet imprévisibles, zones sans réseau. À cela s'ajoute la sensibilité des données manipulées, patients, prescriptions, traçabilité des transports, alors même que les outils à disposition se limitent le plus souvent à des tableaux Excel, à des carnets et à une logistique tenue à la main.

Pendant des années, ces sociétés ont fonctionné ainsi, et la productivité en a pâti. Mon chef m'a confié le sujet dans ce contexte, avec un **cahier des charges** qui en posait les bases : périmètre fonctionnel, exigences réglementaires, contraintes techniques, hébergement envisagé. Le choix de m'y atteler ne m'appartenait donc pas ; ce qui relevait de moi, en revanche, c'était la manière de le mener, à savoir la démarche, les décisions d'architecture et la méthode de travail avec l'IA. C'est ce processus, du cahier des charges jusqu'à l'hébergement, que je détaille ici.

---

## Aperçu de l'interface

Les données affichées (patients, courses, montants) sont des données de démonstration fictives, générées pour les besoins de ces captures et clairement identifiées comme telles dans l'interface (badge « DÉMO »).

<figure>
  <img src="/images/uploads/tap-cockpit.png" alt="Cockpit TAP, vue de la journée en cours avec carte des chauffeurs et alertes" loading="lazy">
  <figcaption>Le cockpit : vue temps réel de la journée d'une régulatrice, courses non affectées, brouillons en attente, carte des chauffeurs, échéances réglementaires.</figcaption>
</figure>

<figure>
  <img src="/images/uploads/tap-dashboard.png" alt="Tableau de bord TAP avec chiffre d'affaires, encours impayé, no-show et top prescripteurs" loading="lazy">
  <figcaption>Le tableau de bord : activité du mois, facturation à traiter, taux de no-show, top des prescripteurs.</figcaption>
</figure>

<figure>
  <img src="/images/uploads/tap-patients.png" alt="Liste des patients TAP avec canal de contact préféré et actions d'archivage" loading="lazy">
  <figcaption>La liste des patients, avec canal de contact préféré par patient (appel, SMS) et dernière course.</figcaption>
</figure>

<figure>
  <img src="/images/uploads/tap-patients-creation.png" alt="Formulaire de création d'un nouveau patient avec NIR, adresse et référent légal" loading="lazy">
  <figcaption>La création d'un patient : identité, NIR chiffré, adresse, référent légal pour les mineurs ou personnes sous tutelle.</figcaption>
</figure>

---

## Le choix de la stack

Le premier arbitrage portait sur les outils, et j'ai retenu un critère unique : ne rien choisir dont je serais incapable de diagnostiquer une panne.

| Couche | Détail |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript strict, Tailwind CSS + shadcn/ui |
| **Backend** | Next.js API Routes / Server Actions, Supabase (Postgres + Auth + Realtime), Row Level Security (RLS) |
| **Tournées** | Heuristique d'optimisation TypeScript native, distance estimée par formule de Haversine corrigée |
| **Cartographie** | MapLibre GL + PMTiles, tuiles vectorielles auto-hébergées (Réunion), sans dépendance à une API tierce payante |
| **Infra** | Turborepo + pnpm workspaces (monorepo), migrations versionnées, Vercel + Supabase en développement, bascule vers un hébergement certifié HDS prévue pour la mise en production commerciale |
| **Sécurité** | CSP, HSTS, X-Frame-Options, RLS forcée sur toutes les tables, chiffrement applicatif, gestion des secrets (Vault) |
| **Dev tools** | Biome (lint + format), Docker (Supabase en local), Claude Code, GitHub Actions (CI) |

---

## Une approche structurée : du cahier des charges à l'architecture

Le projet a démarré avec un **cahier des charges** qui définissait :

- Le périmètre fonctionnel (ce que l'application doit faire, et ce qu'elle ne fait pas).
- Les contraintes réglementaires (RGPD, données de santé, traçabilité).
- Les exigences non fonctionnelles (performance, disponibilité, sécurité).
- Les contraintes techniques (stack envisagée, hébergement).

Le CLAUDE.md a été ma boussole. À chaque choix technique, à chaque compromis, je revenais au cahier des charges pour vérifier que je restais dans le cadre défini.

Ce cahier des charges avait été rédigé avec l'aide de l'IA par une personne solide sur le fond métier, réglementaire et opérationnel, mais sans formation technique. Le dimensionnement d'infrastructure qui en ressortait visait large, pensé pour une échelle que le projet n'a pas vocation à atteindre avant longtemps. Une partie de mon travail a consisté à reprendre ce cadrage à mesure que je découvrais le besoin. Il s'agissait d'aligner l'infrastructure sur l'usage effectif, et non sur ce qu'un outil de génération suggère sans le filtre d'une expertise technique. Le cahier des charges a posé le cap ; l'ajuster à la réalité du terrain a fait partie du travail.

### Les ADR : documenter la pensée

J'ai documenté chaque décision d'architecture dans des ADR (*Architecture Decision Records*). La structure est toujours la même : **Contexte → Décision → Conséquences**.

- **ADR-001** : Monorepo avec Turborepo.
- **ADR-002** : Multi-tenant via Supabase RLS et `organization_id`.
- **ADR-004** : Fournisseur SMS différé, derrière un adaptateur remplaçable.
- **ADR-006** : Portail B2B multi-tenant différé.
- **ADR-010** : Solveur de tournées, d'un microservice Python à une heuristique TypeScript native.
- **ADR-012** : MapLibre + PMTiles pour le rendu carte.

Les ADR ne sont pas là pour faire joli. Quand je suis revenu sur un choix 3 mois plus tard, ils m'ont rappelé pourquoi j'avais pris telle direction, quelles alternatives j'avais écartées, quelles conséquences j'avais anticipées. C'est un outil que je ne pensais pas utile, et que je ne peux plus ignorer aujourd'hui.

### ADR-010, en détail : d'un microservice Python à une heuristique maison

La première version du solveur de tournées était un microservice Python utilisant **OR-Tools**, la bibliothèque d'optimisation combinatoire de Google, capable de résoudre des problèmes de type PDPTW (*Pickup & Delivery with Time Windows*). Sur le papier, l'outil était le bon choix technique.

Le déployer en serverless sur Vercel a posé un problème. 2 facteurs se sont combinés : le binaire OR-Tools pèse environ 75 Mo, ce qui provoque des cold starts trop lents pour le temps de réponse attendu par une régulatrice, et surtout, un problème de routage entre les 2 runtimes du même projet. Next.js renvoyait systématiquement sa propre erreur 404 avant même que Vercel ne puisse aiguiller la requête vers la fonction Python : symptomatiquement, l'endpoint de santé `/api/solver/health` ne répondait jamais, comme si la fonction Python n'existait pas. J'ai tenté 5 corrections, chacune plausible et chacune sans effet sur le symptôme.

- Exclure la route dans le middleware.
- Retirer un préfixe dupliqué du routeur FastAPI.
- Déplacer le fichier de configuration à la racine du bon répertoire.
- Ajouter des règles de réécriture Next.js.
- Reprendre l'ordre des couches d'authentification.

La cause de cet échec répété tient au diagnostic à distance : sans accès aux journaux du tableau de bord Vercel, je ne voyais pas où la requête se perdait.

J'ai alors regardé comment VROOM et KaRRi, 2 projets libres de référence en optimisation de tournées, hébergent leur solveur. Aucun ne tourne en serverless. Tous emploient un conteneur qui reste actif en permanence, ce qui déplaçait le problème de la configuration vers l'architecture. J'allais à contre-courant d'un pattern que la communauté avait déjà écarté pour de bonnes raisons.

En reprenant le problème à froid, un fait a changé la donne : le volume réel de courses à optimiser est de quelques dizaines par jour, très loin de l'échelle pour laquelle OR-Tools est pensé. Le besoin se prêtait à plus simple. Des horaires de dialyse reviennent plusieurs fois par semaine et ne bougent presque pas. Une heuristique en 2 temps suffit : regrouper par compatibilité d'horaires, puis appliquer le plus proche voisin sur une distance à vol d'oiseau corrigée. Le résultat reste très proche de l'optimum, sans les contraintes d'hébergement d'un binaire lourd.

J'ai donc supprimé le microservice Python et réimplémenté le solveur en TypeScript natif, directement dans l'application. Résultat : un calcul qui prenait 1 à 3 secondes de cold start (avec un plafond de 30 secondes en cas d'échec) se fait désormais en quelques millisecondes, sans service à héberger ni facturer séparément. Le compromis assumé, c'est un plan légèrement moins optimal qu'un vrai solveur combinatoire sur des cas de figure complexes ; à l'échelle réelle du projet, l'écart est marginal, et l'interface expose d'ailleurs ces indicateurs comme des estimations, pas comme des valeurs garanties.

### Position des chauffeurs : pointage plutôt que suivi continu

La carte des chauffeurs n'affiche pas de flux GPS animé, pour une raison technique dure. La capture de position continue n'est pas fiable dans une application web installable : elle s'interrompt dès que le chauffeur ouvre une application de navigation ou éteint son écran. Le système capture donc la position au moment des évènements qui comptent (prise en charge, dépose), et l'affiche avec son âge plutôt que de simuler un direct qu'elle ne peut pas garantir.

C'est un principe assumé dans la conception : ne jamais afficher une position comme « en direct » si elle ne l'est pas. Les captures ci-dessus en sont la preuve : le badge « DÉMO » et la mention « vu il y a X min » sont dans l'interface elle-même, pas ajoutés après coup pour cet article.

### La discipline du périmètre : savoir différer

2 autres ADR illustrent le même réflexe que la stack de tournées : ne pas construire ce qui n'est pas encore nécessaire. Le fournisseur SMS retenu au départ, Twilio, posait un problème de conformité. Société américaine soumise au CLOUD Act, pour des messages qui relèvent indirectement de la donnée de santé par leur contenu. Changer de prestataire dans l'urgence aurait immobilisé le reste, donc l'intégration est passée derrière un adaptateur remplaçable. La bascule vers un fournisseur européen se fera sans toucher à la logique métier. Le portail B2B multi-tenant prévu pour les donneurs d'ordres (hôpitaux, cliniques) a lui été purement différé : le construire avant d'avoir validé le produit avec un premier client réel aurait immobilisé du temps sur une brique qu'aucun des parcours métier actuels ne requiert.

---

## La sécurité : une exigence qui structure tout

Je signe seul les politiques de sécurité, alors je les écris comme si quelqu'un devait les auditer. TAP manipule des données de santé. L'article 9 du RGPD interdit leur traitement sauf fondement juridique spécifique. Cette contrainte a guidé chaque choix d'architecture, chaque ligne de code, chaque décision d'infrastructure.

J'ai adopté une approche de **sécurité par la conception** (*security by design*), en superposant plusieurs couches de protection.

### Gestion des secrets et des clés API

La clé `service_role` de Supabase contourne toutes les politiques RLS. Si elle fuit, c'est toute la base qui est exposée.

J'ai donc structuré le projet comme suit :

- La clé `anon` (publique) est utilisée côté client, avec RLS pour contrôler l'accès.
- La clé `service_role` n'est utilisée que dans le code serveur (API Routes, Server Components).
- Les variables d'environnement sont stockées dans un fichier `.env.local` non versionné.

Pas de `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. Pas de clé dure. Pas de compromis.

### Row Level Security (RLS) : la porte d'entrée obligatoire

Supabase expose la base de données directement via l'API. Sans RLS, n'importe qui avec la clé `anon` peut lire ou modifier toutes les tables. J'ai donc **activé RLS sur chaque table**.

```sql
alter table public.organizations enable row level security;
alter table public.organizations force row level security;

alter table public.rides enable row level security;
alter table public.rides force row level security;
```

Avec RLS activé et sans politiques définies, une table est complètement inaccessible. C'est le comportement par défaut que j'ai choisi : rien n'est accessible tant que je n'ai pas explicitement défini qui peut accéder à quoi. Sur les tables métier, je force en plus la sécurité au niveau des lignes avec `FORCE ROW LEVEL SECURITY`. Une requête qui passerait par le propriétaire de la table reste alors soumise aux politiques. Cela ferme la porte à un bug applicatif qui emploierait `service_role` par erreur côté client.

### Politiques RLS : des règles granulaires

J'ai écrit des politiques pour chaque table, en suivant le principe du **moindre privilège**.

```sql
-- Isolation multi-tenant : chaque table métier filtre sur organization_id
create policy rides_select_same_org on public.rides
  for select to authenticated
  using (organization_id = public.current_organization_id());

-- Seuls une régulatrice ou un dirigeant peuvent créer une course
create policy rides_insert_regulateur_dirigeant on public.rides
  for insert to authenticated
  with check (
    organization_id = public.current_organization_id()
    and created_by = auth.uid()
    and (
      public.has_role('regulateur'::public.user_role)
      or public.has_role('dirigeant'::public.user_role)
    )
  );
```

Autre garde-fou du même ordre : un trigger empêche un utilisateur de s'élever lui-même en dirigeant, ou de se transférer vers une autre organisation, en modifiant son propre profil.

```sql
-- Tout rôle autre que dirigeant : interdit de changer organization_id, role ou actif
if new.organization_id is distinct from old.organization_id then
  raise exception 'Modification interdite : organization_id'
    using errcode = '42501';
end if;

if new.role is distinct from old.role then
  raise exception 'Modification interdite : role'
    using errcode = '42501';
end if;
```

Les politiques RLS ajoutent implicitement des clauses `WHERE` à chaque requête. C'est la base de données qui applique les règles d'accès, pas le code applicatif. Un bug dans l'application ne peut pas contourner ces contrôles.

### Authentification et sessions

TAP utilise **Supabase Auth** avec des tokens JWT, signés avec des clés asymétriques. Un JWT, pour *JSON Web Token*, est un jeton auto-porteur. Il transporte l'identité de l'utilisateur et quelques métadonnées, encodées et signées numériquement. Le serveur vérifie donc qui fait la requête en contrôlant la signature, sans interroger la base de données à chaque appel. Les tokens sont automatiquement envoyés par les clients Supabase lorsque l'utilisateur est connecté, et je m'en sers pour :

- Valider l'identité à chaque requête.
- Injecter `auth.uid()` dans les politiques RLS.
- Gérer les sessions et les rafraîchissements.

Les clés de signature sont **rotées régulièrement**.

### Chiffrement des données

Supabase chiffre toutes les données au repos (AES-256) et en transit (TLS). Pour les données de santé, j'ai ajouté une couche supplémentaire : les champs sensibles sont **chiffrés au niveau de l'application** avant d'être stockés. J'utilise l'extension **Vault** de Supabase pour stocker les clés de chiffrement.

### En-têtes de sécurité HTTP

J'ai configuré plusieurs en-têtes dans `next.config.js` :

- **Content-Security-Policy (CSP)** : restreint les sources de contenu.
- **Strict-Transport-Security (HSTS)** : force les connexions HTTPS.
- **X-Frame-Options** : empêche le clickjacking.
- **X-Content-Type-Options** : empêche le MIME-sniffing.

### Hébergement sur OVHCloud

OVHCloud héberge les serveurs en France, ce qui évite tout transfert de données hors de l'Union européenne. L'infrastructure est conçue pour la conformité RGPD.

---

## Construire le contexte : la vraie valeur ajoutée

Le code généré par l'IA n'est que la partie visible de l'iceberg : ce qui a pris le plus de temps, et qui a fait toute la différence, c'est la construction du contexte qui l'entoure.

### Le CLAUDE.md : le cerveau partagé

Le fichier `CLAUDE.md` a été un travail considérable. Il décrit :

- Les principes de conception (inspirés de Linear, Notion, Stripe).
- Les patterns d'architecture adoptés.
- Les contraintes métier et techniques.
- Les bonnes pratiques du projet (TypeScript, Tailwind, sécurité).
- Les décisions clés et leur justification.

Son importance tient à ce qu'il **donne le contexte à Claude** : quand je lui demande de générer une nouvelle fonctionnalité, il dispose déjà en mémoire de toute l'architecture du projet et ne repart donc jamais de zéro.

C'est la différence entre « avoir un assistant qui code » et « avoir un outil qui comprend le projet ». Le CLAUDE.md transforme l'IA d'un générateur de code en un outil de conception.

---

## L'IA comme outil principal : une relation qui s'apprend

Décider seul demande un contradicteur, et je m'en suis fabriqué un. J'ai utilisé **Claude Code** intensivement, non pas en mode « génère-moi ceci », mais en mode **dialogue**.

### Le cycle de travail

1. Je pose une question – une problématique d'architecture ou de conception.
2. Claude propose – une solution, des alternatives, parfois des contre-arguments.
3. Je creuse – je demande des précisions, je confronte avec le cahier des charges.
4. Je tranche – c'est moi qui décide de la direction à prendre.
5. Claude génère le code – une première version structurée.
6. Je relis – chaque ligne, chaque fonction, chaque structure.
7. Je reconduis – je reprends ce qui est bon, je modifie ce qui ne l'est pas.

Ce cycle m'a permis d'avancer à un rythme que je n'aurais jamais atteint seul, même si c'est toujours moi qui garde la main sur les décisions.

### Trouver les points de friction

Mon vrai travail a consisté à **découvrir les points de friction** :

- L'IA génère une structure de données. Est-elle adaptée aux requêtes qu'on va faire ?
- Elle propose une logique d'affectation. Tient-elle la route dans tous les cas ?
- Elle suggère un pattern d'authentification. Est-il compatible avec la RLS ?

Ce sont des questions que je suis seul à pouvoir poser, parce que je connais le projet, son contexte et son cahier des charges bien mieux que ce que l'IA pourrait en déduire : elle ne peut tout simplement pas les voir venir.

### Reconnaître les patterns, pas coudre des solutions

Je ne réinvente pas la roue : lorsqu'un pattern existe déjà, que ce soit dans React, Supabase ou Next.js, je m'appuie dessus plutôt que d'en recréer un. Mon travail consiste à :

- Reconnaître les patterns qui s'appliquent à mon problème.
- Les adapter au contexte de TAP (temporalité, données de santé, RGPD).
- Les intégrer proprement.

L'IA en génère le squelette ; à moi, ensuite, d'en assembler les pièces.

### Le skill pour la documentation

J'ai développé un **skill Claude** pour produire de la documentation au format DOCX. Il prend le code, les ADR, le contexte, et génère une documentation structurée, prête à être partagée avec l'équipe ou le chef de projet.

La documentation est le ciment du projet. Sans elle, le code devient vite incompréhensible.

---

## L'observation terrain : la dernière pièce

J'ai gardé une décision pour la fin, celle du moment où regarder le terrain. Contrairement au « design thinking », je n'ai pas commencé par observer les régulatrices. Le projet a été construit à partir du cahier des charges, des spécifications recueillies, de la documentation réglementaire, et de ma connaissance des systèmes de régulation.

L'observation terrain est **la dernière pièce**. Elle viendra après le déploiement :

1. Bascule vers un hébergement certifié HDS pour la production commerciale.
2. Déploiement progressif auprès de sociétés pilotes.
3. Observation des régulatrices à leur poste.
4. Ajustements basés sur les retours.

Le produit est conçu à partir des besoins exprimés et du cadre défini. Puis il est confronté à la réalité du terrain. C'est cette confrontation qui permet d'affiner, pas l'observation préalable qui ne vaut jamais un vrai usage en conditions réelles.

---

## Ce que j'en ai retenu

### La sécurité n'est pas une option

C'est une contrainte qui structure tout. Le RGPD, les données de santé, la RLS, le chiffrement, les en-têtes HTTP – chaque choix technique a été filtré par le prisme de la sécurité. C'est ce qui donne sa cohérence au projet.

### L'IA est un outil, pas un magicien

L'IA génère du code, mais c'est moi qui le relis, qui le comprends, qui le corrige et qui décide de le conserver ou non. C'est moi, également, qui pose les bonnes questions, qui repère les points de friction et qui valide chaque choix : l'IA reste un accélérateur de réflexion, non un remplaçant.

Je tape moi-même une minorité des lignes ; Claude Code en écrit l'essentiel. Ça ne réduit pas le travail, ça le déplace ailleurs que dans le clavier. 3 décisions résument l'année.

- Le renoncement à OR-Tools après 5 tentatives de déploiement ratées.
- Le choix de différer le portail B2B.
- La bascule vers une sécurité au niveau des lignes forcée sur chaque table.

Aucune ne se lit dans un différentiel de code. Elles se lisent dans le nombre de fois où j'ai tranché, où je suis revenu en arrière, et où j'ai documenté pourquoi. Compter les lignes tapées à la main pour évaluer l'ampleur d'un projet passe à côté de l'essentiel du travail.

### Le contexte est plus important que le code

Un projet sans contexte tourne en rond. Le CLAUDE.md, les ADR, le cahier des charges – c'est ce qui structure la réflexion. C'est ce qui permet de prendre des décisions cohérentes sur la durée.

### La documentation n'est pas optionnelle

J'ai passé des heures à documenter. Des ADR, des specs, des commentaires dans le code. C'est un investissement qui a payé à chaque fois que je suis revenu sur une partie du projet après plusieurs semaines.

### L'observation est la dernière étape, pas la première

On ne conçoit pas un produit en observant des utilisateurs. On le conçoit à partir d'un besoin exprimé et d'un cadre défini. L'observation sert ensuite à l'affiner. L'ordre est important.

### Porter seul le sujet, et le documenter en conséquence

Je suis, dans les faits, le seul informaticien du service. Cela a fait de moi le chef de projet sans que le titre en soit officiellement posé, et sans relecture technique en interne pour challenger mes choix au fil de l'eau. C'est une vraie liberté, mais aussi une responsabilité : j'ai appris énormément, et vraiment sur le tas, en confrontant chaque décision directement à la réalité du terrain plutôt qu'à une hiérarchie technique qui n'existe pas dans ce service.

Le vrai enseignement de cette position, c'est qu'il aurait fallu consigner l'avancement au fil de l'eau et le signaler plus régulièrement. Faute de relecture interne, je produis moi-même la trace de la progression, et je la produis en continu. Je le sais maintenant pour la suite : mieux vaut noter et remonter l'état d'avancement de façon régulière et lisible, plutôt que d'essayer de reconstituer plusieurs mois de décisions a posteriori.

Concrètement, cela s'est traduit par un dossier de planification versionné avec le reste du code, tenu à jour au fil des sessions avec Claude Code, en complément du `CLAUDE.md` et des ADR. Sans être un journal de bord parfait, il est devenu ma boussole pour savoir où j'en suis et où je vais, plutôt que de reconstruire l'état du projet de mémoire à chaque point d'étape.

Il y a aussi une raison plus terre-à-terre au choix de Vercel comme hébergement de développement : mon chef n'est pas développeur, il ne peut pas juger l'avancement du projet en lisant du code. Vercel déploie automatiquement une préversion accessible par simple lien à chaque changement poussé sur le dépôt, ce qui lui permet de voir l'état réel de l'application sans rien installer et sans avoir à comprendre la stack technique. Bien qu'absent des ADR, ce mécanisme est devenu de fait mon principal outil de reporting visuel au quotidien.

---

## Perspectives

Le socle technique de TAP est posé : sécurité, architecture, cœur fonctionnel de régulation. Le projet reste cela dit en développement actif, pas en phase de clôture. La suite ne dépend plus de moi. Le passage à un hébergement certifié HDS, le choix des sociétés pilotes et le rythme du déploiement relèvent de décisions commerciales, arbitrées par mon chef et non encore tranchées. Ma part du travail s'arrête à la livraison d'un outil fonctionnel et correctement sécurisé ; le calendrier de la suite ne dépend pas de mes choix.

---

## En résumé

TAP est un projet livrable : un cahier des charges professionnel, des utilisateurs cibles clairement identifiés, des contraintes opposables (données de santé, RGPD, géographie), une sécurité pensée dès la conception, une stack moderne, et une approche de l'IA assumée. L'IA génère, je relis et je reconduis. Le contexte, documenté dans le CLAUDE.md et les ADR, est ce qui fait la différence.

---

## Compétences mobilisées

Le projet se relit ici sous l'angle « défi rencontré, solution retenue, résultat concret ». C'est le format qu'attend un lecteur pressé qui veut savoir ce que je sais faire.

**Concevoir une architecture qui protège des données de santé.**
Défi : livrer un SaaS traitant du NIR, des prescriptions et de la traçabilité, sous contrainte RGPD article 9, sans budget d'infrastructure.
Réponses :

- Sécurité au niveau des lignes forcée sur toutes les tables métier.
- Filtrage par `organization_id` injecté depuis les métadonnées du jeton.
- Déclencheur PostgreSQL interdisant à un non-dirigeant de modifier son rôle ou son organisation.
- Chiffrement applicatif AES-GCM au-dessus de celui de Supabase, sur les champs sensibles.
- Clé `service_role` cantonnée au serveur.
Résultat : une isolation multi-tenant qui reste vraie même en cas de bug applicatif, puisqu'elle est appliquée par la base et non par le code.

**Substituer une heuristique maison à un solveur externe.**
Défi : le microservice Python OR-Tools initialement retenu produisait des cold starts de 1 à 3 secondes en serverless, avec un plafond à 30 secondes en cas d'échec, incompatible avec le temps de réponse attendu par une régulatrice.
Réponse : après 5 tentatives de correction du routage entre runtimes Next.js et Python, réimplémentation d'un solveur en TypeScript natif directement dans l'application (regroupement par compatibilité d'horaires, plus proche voisin sur distance Haversine corrigée).
Résultat : calcul ramené à quelques millisecondes, un service en moins à héberger, une facturation à l'appel évitée.

**Piloter un projet en tant que seul informaticien du service.**
Défi : jouer sur 3 rôles simultanés (développeur, chef de projet, interlocuteur métier) sans relecture technique interne, avec un cahier des charges initial rédigé par IA par une personne non technique et surdimensionné.
Réponses :

- ADR versionnées pour chaque décision structurante.
- Dossier de planification tenu au fil des sessions.
- Vercel comme préversion cliquable, pour qu'un chef non technique constate l'avancement par lui-même.
- Retour argumenté et progressif sur les points du cahier des charges à réajuster.
Résultat : un projet livré et documenté de façon reprise-friendly, dont la mise en production dépend désormais d'un arbitrage commercial et non d'une brique technique manquante.

**Utiliser Claude Code sans lui déléguer la décision.**
Défi : intégrer l'IA au flux de travail sans que le code livré soit une accumulation de suggestions non filtrées.
Réponses :

- Cycle question, proposition, confrontation au cahier des charges, arbitrage, génération, relecture ligne à ligne.
- `CLAUDE.md` maintenu comme mémoire partagée.
- Points de friction identifiés en amont : une structure de données proposée tient-elle la charge des requêtes prévues ?
Résultat : une minorité de lignes tapées à la main, l'essentiel des arbitrages assumé par moi, ce qui se lit dans l'historique des décisions plutôt que dans les diffs.
