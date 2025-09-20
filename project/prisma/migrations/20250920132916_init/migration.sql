-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantiteInitiale" INTEGER NOT NULL,
    "quantiteActuelle" INTEGER NOT NULL,
    "seuilCritique" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL,
    "derniereModification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BonAttribution" (
    "id" TEXT NOT NULL,
    "numerobon" TEXT NOT NULL,
    "articles" JSONB NOT NULL,
    "destinataire" TEXT NOT NULL,
    "dateAttribution" TIMESTAMP(3) NOT NULL,
    "utilisateur" TEXT NOT NULL,
    "statut" TEXT NOT NULL,

    CONSTRAINT "BonAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mouvement" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "utilisateur" TEXT NOT NULL,
    "commentaire" TEXT,

    CONSTRAINT "Mouvement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL,
    "derniereConnexion" TIMESTAMP(3),
    "doitChangerMotDePasse" BOOLEAN NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AlerteStock" (
    "articleId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantiteActuelle" INTEGER NOT NULL,
    "seuilCritique" INTEGER NOT NULL,
    "niveau" TEXT NOT NULL,

    CONSTRAINT "AlerteStock_pkey" PRIMARY KEY ("articleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "public"."Utilisateur"("email");
