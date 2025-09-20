import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Add a test user
  const user = await prisma.utilisateur.create({
    data: {
      id: 'user-1',
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@example.com',
      motDePasse: 'password123',
      role: 'admin',
      actif: true,
      dateCreation: new Date(),
      doitChangerMotDePasse: false,
    },
  });

  // Add a test article
  const article = await prisma.article.create({
    data: {
      id: 'article-1',
      reference: 'ART-001',
      designation: 'Stylo',
      description: 'Stylo bleu',
      quantiteInitiale: 100,
      quantiteActuelle: 80,
      seuilCritique: 10,
      dateCreation: new Date(),
      derniereModification: new Date(),
    },
  });

  // Add a test mouvement
  await prisma.mouvement.create({
    data: {
      id: 'mvt-1',
      articleId: article.id,
      type: 'entree',
      quantite: 20,
      date: new Date(),
      reference: 'ENT-001',
      utilisateur: user.email,
    },
  });

  // Add a test BonAttribution
  await prisma.bonAttribution.create({
    data: {
      id: 'bon-1',
      numerobon: 'BON-001',
      articles: JSON.stringify([
        { articleId: article.id, designation: article.designation, quantiteSortie: 5 }
      ]),
      destinataire: 'Jane Smith',
      dateAttribution: new Date(),
      utilisateur: user.email,
      statut: 'valide',
    },
  });

  // Add a test AlerteStock
  await prisma.alerteStock.create({
    data: {
      articleId: article.id,
      designation: article.designation,
      quantiteActuelle: article.quantiteActuelle,
      seuilCritique: article.seuilCritique,
      niveau: 'faible',
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
