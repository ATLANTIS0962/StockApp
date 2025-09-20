import React, { useRef, useEffect, useState } from 'react';
import { BonAttribution, Article } from '../types';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { X, Printer, Download } from 'lucide-react';

interface BonPrintProps {
  bon: BonAttribution;
  articles: Article[];
  onClose: () => void;
}

const BonPrint: React.FC<BonPrintProps> = ({ bon, articles, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Générer le QR code avec les informations du bon
    const qrData = JSON.stringify({
      id: bon.id,
      numero: bon.numerobon,
      destinataire: bon.destinataire,
      date: bon.dateAttribution,
      articles: bon.articles.length,
      total: bon.articles.reduce((sum, a) => sum + a.quantiteSortie, 0)
    });

    QRCode.toDataURL(qrData, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      setQrCodeUrl(url);
    }).catch(err => {
      console.error('Erreur génération QR code:', err);
    });
  }, [bon]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Contenu HTML complet pour l'impression
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bon d'Attribution ${bon.numerobon}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            line-height: 1.4; 
            color: #000; 
            background: #fff;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 10px; 
          }
          .document-title { 
            font-size: 20px; 
            color: #666; 
          }
          .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            flex-wrap: wrap;
          }
          .info-block { 
            flex: 1; 
            margin-right: 20px; 
            min-width: 200px;
            margin-bottom: 15px;
          }
          .info-block h3 { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
            font-weight: bold; 
          }
          .info-block p { 
            font-size: 16px; 
            margin: 5px 0; 
            color: #333; 
          }
          .qr-section { 
            text-align: center; 
            margin: 20px 0; 
          }
          .qr-section img {
            max-width: 150px;
            height: auto;
          }
          .articles-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
          }
          .articles-table th, .articles-table td { 
            border: 2px solid #000; 
            padding: 8px; 
            text-align: left; 
            font-size: 12px; 
          }
          .articles-table th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .articles-table tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .total-row { 
            font-weight: bold; 
            background-color: #e8f4f8 !important; 
          }
          .footer { 
            margin-top: 50px; 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
          }
          .signatures { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 40px; 
            flex-wrap: wrap;
          }
          .signature-block { 
            text-align: center; 
            width: 200px; 
            margin-bottom: 20px;
          }
          .signature-line { 
            border-bottom: 1px solid #333; 
            margin-bottom: 10px; 
            height: 50px; 
          }
          .status-badge { 
            display: inline-block; 
            padding: 5px 15px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
          }
          .status-en_attente { 
            background-color: #fff3cd; 
            color: #856404; 
          }
          .status-valide { 
            background-color: #d4edda; 
            color: #155724; 
          }
          .status-annule { 
            background-color: #f8d7da; 
            color: #721c24; 
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- En-tête -->
        <div class="header">
          <div class="company-name">STOCK MANAGER</div>
          <div class="document-title">BON D'ATTRIBUTION</div>
        </div>

        <!-- Informations générales -->
        <div class="info-section">
          <div class="info-block">
            <h3>Numéro de Bon</h3>
            <p>${bon.numerobon}</p>
            
            <h3>Date d'Attribution</h3>
            <p>${new Date(bon.dateAttribution).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div class="info-block">
            <h3>Destinataire</h3>
            <p>${bon.destinataire}</p>
            
            <h3>Créé par</h3>
            <p>${bon.utilisateur}</p>
          </div>
          
          <div class="info-block">
            <h3>Statut</h3>
            <p>
              <span class="status-badge status-${bon.statut}">
                ${getStatusLabel(bon.statut)}
              </span>
            </p>
            
            <h3>Total Articles</h3>
            <p>${bon.articles.length} articles (${totalQuantite} unités)</p>
          </div>
        </div>

        <!-- QR Code -->
        ${qrCodeUrl ? `
        <div class="qr-section">
          <img src="${qrCodeUrl}" alt="QR Code" />
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            QR Code pour vérification
          </p>
        </div>
        ` : ''}

        <!-- Tableau des articles -->
        <table class="articles-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Désignation</th>
              <th style="width: 120px;">Référence</th>
              <th style="width: 100px;">Quantité</th>
              <th style="width: 120px;">Stock Restant</th>
            </tr>
          </thead>
          <tbody>
            ${bon.articles.map((articleBon, index) => {
              const article = articles.find(a => a.id === articleBon.articleId);
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${articleBon.designation}</td>
                  <td>${article?.reference || 'N/A'}</td>
                  <td style="text-align: center; font-weight: bold;">
                    ${articleBon.quantiteSortie}
                  </td>
                  <td style="text-align: center;">
                    ${article ? article.quantiteActuelle : 'N/A'}
                  </td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-weight: bold;">
                TOTAL GÉNÉRAL
              </td>
              <td style="text-align: center; font-weight: bold;">
                ${totalQuantite}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <!-- Pied de page -->
        <div class="footer">
          <p style="font-size: 12px; color: #666; margin-bottom: 20px;">
            Ce bon d'attribution a été généré automatiquement par Stock Manager le 
            ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}.
          </p>
          
          <!-- Signatures -->
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <p><strong>Émetteur</strong></p>
              <p>${bon.utilisateur}</p>
            </div>
            
            <div class="signature-block">
              <div class="signature-line"></div>
              <p><strong>Destinataire</strong></p>
              <p>${bon.destinataire}</p>
            </div>
            
            <div class="signature-block">
              <div class="signature-line"></div>
              <p><strong>Responsable Stock</strong></p>
              <p>Date: ___________</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleDownloadPDF = async () => {
    const printContent = printRef.current;
    if (!printContent) return;

    try {
      // Créer un canvas à partir du contenu HTML
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: printContent.scrollWidth,
        height: printContent.scrollHeight
      });

      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Télécharger le PDF
      pdf.save(`Bon_Attribution_${bon.numerobon}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getStatusLabel = (statut: BonAttribution['statut']) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'valide': return 'Validé';
      case 'annule': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const totalQuantite = bon.articles.reduce((sum, article) => sum + article.quantiteSortie, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header avec boutons */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Aperçu d'impression - {bon.numerobon}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} className="mr-2" />
              Imprimer
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} className="mr-2" />
              PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenu à imprimer */}
        <div ref={printRef} className="p-8 max-w-4xl mx-auto bg-white">
          {/* En-tête */}
          <div className="text-center border-b-2 border-gray-800 pb-5 mb-8">
            <div className="text-2xl font-bold text-gray-800 mb-2">STOCK MANAGER</div>
            <div className="text-xl text-gray-600">BON D'ATTRIBUTION</div>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1">Numéro de Bon</h3>
              <p className="text-base text-gray-900">{bon.numerobon}</p>
              
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1 mt-4">Date d'Attribution</h3>
              <p className="text-base text-gray-900">{new Date(bon.dateAttribution).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1">Destinataire</h3>
              <p className="text-base text-gray-900">{bon.destinataire}</p>
              
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1 mt-4">Créé par</h3>
              <p className="text-base text-gray-900">{bon.utilisateur}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1">Statut</h3>
              <div className="mb-4">
                <span className={`status-badge status-${bon.statut}`}>
                  {getStatusLabel(bon.statut)}
                </span>
              </div>
              
              <h3 className="text-sm font-bold text-gray-600 uppercase mb-1">Total Articles</h3>
              <p className="text-base text-gray-900">{bon.articles.length} articles ({totalQuantite} unités)</p>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="text-center my-6">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" style={{ maxWidth: '150px' }} />
              <p className="text-xs text-gray-600 mt-2">
                QR Code pour vérification
              </p>
            </div>
          )}

          {/* Tableau des articles */}
          <div className="overflow-hidden border-2 border-gray-800 rounded-lg mb-8">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-2 border-gray-800 px-3 py-2 text-left text-xs font-bold" style={{ width: '50px' }}>#</th>
                  <th className="border-2 border-gray-800 px-3 py-2 text-left text-xs font-bold">Désignation</th>
                  <th className="border-2 border-gray-800 px-3 py-2 text-left text-xs font-bold" style={{ width: '120px' }}>Référence</th>
                  <th className="border-2 border-gray-800 px-3 py-2 text-left text-xs font-bold" style={{ width: '100px' }}>Quantité</th>
                  <th className="border-2 border-gray-800 px-3 py-2 text-left text-xs font-bold" style={{ width: '120px' }}>Stock Restant</th>
                </tr>
              </thead>
              <tbody>
                {bon.articles.map((articleBon, index) => {
                  const article = articles.find(a => a.id === articleBon.articleId);
                  return (
                    <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border-2 border-gray-800 px-3 py-2 text-xs">{index + 1}</td>
                      <td className="border-2 border-gray-800 px-3 py-2 text-xs">{articleBon.designation}</td>
                      <td className="border-2 border-gray-800 px-3 py-2 text-xs">{article?.reference || 'N/A'}</td>
                      <td className="border-2 border-gray-800 px-3 py-2 text-xs text-center font-bold">
                        {articleBon.quantiteSortie}
                      </td>
                      <td className="border-2 border-gray-800 px-3 py-2 text-xs text-center">
                        {article ? article.quantiteActuelle : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-blue-100 font-bold">
                  <td colSpan={3} className="border-2 border-gray-800 px-3 py-2 text-xs text-right font-bold">
                    TOTAL GÉNÉRAL
                  </td>
                  <td className="border-2 border-gray-800 px-3 py-2 text-xs text-center font-bold">
                    {totalQuantite}
                  </td>
                  <td className="border-2 border-gray-800 px-3 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pied de page */}
          <div className="mt-12 border-t border-gray-300 pt-5">
            <p className="text-xs text-gray-600 mb-5">
              Ce bon d'attribution a été généré automatiquement par Stock Manager le{' '}
              {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}.
            </p>
            
            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="text-center">
                <div className="border-b border-gray-800 mb-2 h-12"></div>
                <p className="font-bold">Émetteur</p>
                <p className="text-sm">{bon.utilisateur}</p>
              </div>
              
              <div className="text-center">
                <div className="border-b border-gray-800 mb-2 h-12"></div>
                <p className="font-bold">Destinataire</p>
                <p className="text-sm">{bon.destinataire}</p>
              </div>
              
              <div className="text-center">
                <div className="border-b border-gray-800 mb-2 h-12"></div>
                <p className="font-bold">Responsable Stock</p>
                <p className="text-sm">Date: ___________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonPrint;