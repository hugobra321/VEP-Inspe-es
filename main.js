// === Arrays com os itens de cada seção ===

const checklistItems = [
  "Insuficiência de colchões",
  "Deficiência do atendimento médico",
  "Insuficiência de medicamentos",
  "Poucas oportunidades de estudo interno",
  "Poucas oportunidades de trabalho com artesanato",
  "Falta de assistência odontológica",
  "Falha no abastecimento de água",
  "Desrespeito aos direitos dos presos indígenas",
  "Ausência de separação de presos LGBTQIA+, indígenas e idosos",
  "Falta de oportunização de leitura",
  "Ausência de fornecimento de uniformes e roupas de cama",
  "Falta de fornecimento de absorventes íntimos",
  "Deficiências na estrutura dos alojamentos dos policiais penais",
  "Falta de plano de prevenção e combate a incêndio",
  "Tempo insuficiente de banho de sol",
  "Baixo efetivo de policiais",
  "Criação de protocolos para reduzir o controle das fações dentro dos presídios",
  "Criação de alas de isolamento para doenças infectocontagiosas",
  "Necessidade de padronização do envio mensal de relatórios sobre remição de pena",
  "Fornecimento de itens de higiene pessoal e higiene das celas",
  "Alimentação em desacordo com o contrato"
];

const humanitarianItems = [
  "Reeducando agredido",
  "Reeducando com atendimento médico/receita médica pendente",
  "Reeducando analfabeto",
  "Reeducanda gestante/lactante",
  "Reeducando há mais de 10 dias em isolamento cautelar"
];

const structuralItems = [
  "Alguma parte da UP com sinal de celular disponível",
  "Câmera de segurança inoperante"
];


// === Funções auxiliares ===

// Formata data do formato "yyyy-mm-dd" para "dd/mm/aaaa"
function formatDateStr(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : dateStr;
}

/**
 * Desenha um bloco com rótulo e valor alinhados.
 */
function drawLabelValueBlock(doc, label, value, x, y, labelWidth, valueWidth, lineHeight) {
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  y = drawJustifiedTextBlock(doc, value, x + labelWidth, y, valueWidth, lineHeight);
  return y;
}

/**
 * Desenha um bloco de texto justificado, verificando a margem inferior.
 * Se a próxima linha ultrapassar 20 mm da margem inferior, adiciona nova página.
 */
function drawJustifiedTextBlock(doc, text, x, y, maxWidth, lineHeight) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;
  const paragraphs = text.split("\n");
  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/);
    let lines = [];
    let currentLine = [];
    let currentLineWidth = 0;
    const spaceWidth = doc.getTextWidth(" ");
    
    words.forEach((word) => {
      const wordWidth = doc.getTextWidth(word);
      if (currentLine.length === 0) {
        currentLine.push(word);
        currentLineWidth = wordWidth;
      } else if (currentLineWidth + spaceWidth + wordWidth <= maxWidth) {
        currentLine.push(word);
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        lines.push(currentLine);
        currentLine = [word];
        currentLineWidth = wordWidth;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    lines.forEach((lineWords, index) => {
      if (y + lineHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20;
      }
      
      if (lineWords.length > 1 && index < lines.length - 1) {
        const totalWordsWidth = lineWords.reduce((sum, w) => sum + doc.getTextWidth(w), 0);
        const gaps = lineWords.length - 1;
        const extraSpace = (maxWidth - totalWordsWidth - (gaps * doc.getTextWidth(" "))) / gaps;
        let currentX = x;
        lineWords.forEach((word, i) => {
          doc.text(word, currentX, y);
          currentX += doc.getTextWidth(word);
          if (i < gaps) {
            currentX += doc.getTextWidth(" ") + extraSpace;
          }
        });
      } else {
        doc.text(lineWords.join(" "), x, y);
      }
      y += lineHeight;
    });
  });
  return y;
}

/**
 * Quebra texto sem justificação extra.
 */
function drawWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    if (y + lineHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

/**
 * Converte arquivo para DataURL (para fotos)
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}


// === Service Worker ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('Service Worker registrado com sucesso!', reg))
    .catch(err => console.error('Erro no registro do Service Worker', err));
}


// === Configuração do DOM ===
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado. Configurando formulários e eventos...");

  // Geração dinâmica do Checklist de Inspeção
  const checklistContainer = document.getElementById('checklistContainer');
  checklistItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = "checklist-item";
    div.innerHTML = `
      <label>${index + 1}. ${item}:</label>
      <select name="item_${index + 1}">
        <option value="">Selecione</option>
        <option value="resolvido">✔ Resolvido</option>
        <option value="pendente">❌ Pendente</option>
        <option value="naoVerificado">⚠️ Não Verificado</option>
      </select>
    `;
    checklistContainer.appendChild(div);
  });

  // Geração dinâmica dos Relatos Humanitários
  const humanitarianContainer = document.getElementById('humanitarianContainer');
  humanitarianItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = "checklist-item";
    div.innerHTML = `
      <label>${item}:</label>
      <select name="humanitarian_item_${index + 1}" class="humanitarian-select">
        <option value="">Selecione</option>
        <option value="sim">✔ Sim</option>
        <option value="nao">❌ Não</option>
      </select>
      <textarea name="humanitarian_obs_${index + 1}" class="humanitarian-obs" style="display: none;" placeholder="Descreva os achados..."></textarea>
    `;
    humanitarianContainer.appendChild(div);
    const selectElement = div.querySelector('.humanitarian-select');
    const textareaElement = div.querySelector('.humanitarian-obs');
    selectElement.addEventListener('change', function() {
      textareaElement.style.display = (selectElement.value === 'sim') ? 'block' : 'none';
      if (selectElement.value !== 'sim') textareaElement.value = '';
    });
  });

  // Geração dinâmica das Questões Estruturais
  const structuralContainer = document.getElementById('structuralContainer');
  structuralItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = "checklist-item";
    div.innerHTML = `
      <label>${item}:</label>
      <select name="structural_item_${index + 1}" class="structural-select">
        <option value="">Selecione</option>
        <option value="sim">✔ Sim</option>
        <option value="nao">❌ Não</option>
      </select>
      <textarea name="structural_obs_${index + 1}" class="structural-obs" style="display: none;" placeholder="Descreva os achados..."></textarea>
    `;
    structuralContainer.appendChild(div);
    const selectElement = div.querySelector('.structural-select');
    const textareaElement = div.querySelector('.structural-obs');
    selectElement.addEventListener('change', function() {
      textareaElement.style.display = (selectElement.value === 'sim') ? 'block' : 'none';
      if (selectElement.value !== 'sim') textareaElement.value = '';
    });
  });

  // Configuração para exibir/ocultar a caixa de texto na seção "Outras determinações"
  const otherDetChoice = document.getElementById('other_determinations_choice');
  const otherDetTextarea = document.getElementById('other_determinations');
  if (otherDetChoice && otherDetTextarea) {
    otherDetChoice.addEventListener('change', function() {
      if (otherDetChoice.value === "sim") {
        otherDetTextarea.style.display = "block";
      } else {
        otherDetTextarea.style.display = "none";
        otherDetTextarea.value = "";
      }
    });
  }

  // Evento para Gerar o PDF
  document.getElementById('generatePDF').addEventListener('click', async function() {
    console.log("Botão Gerar PDF clicado.");
    try {
      const form = document.getElementById('inspectionForm');
      const formData = new FormData(form);
      let data = {};
      formData.forEach((value, key) => {
        if (!key.endsWith("[]")) {
          data[key] = value;
        }
      });
      const rawDates = formData.getAll("inspection_date[]");
      const formattedDates = rawDates.map(formatDateStr).join(", ");
      data["inspection_date"] = formattedDates;
      data["prison_unit"] = formData.getAll("prison_unit[]").join(", ");
      data["other_records_presidencia"] = formData.get("other_records_presidencia") || "";
      data["other_records_direcao"] = formData.get("other_records_direcao") || "";
      data["other_determinations_choice"] = formData.get("other_determinations_choice") || "nao";
      data["other_determinations"] = formData.get("other_determinations") || "";
      
      console.log("Dados do formulário:", data);
      localStorage.setItem('inspectionData', JSON.stringify(data));

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      console.log("jsPDF instanciado.");

      // Cabeçalho com fundo vermelho
      doc.setFillColor(139, 0, 0);
      doc.rect(0, 0, 210, 30, 'F');

      // Cabeçalho textual atualizado
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Termo de Inspeção", 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text("Vara de Execução de Penas no Regime Fechado", 105, 22, { align: 'center' });
      doc.text("Corregedoria dos Presídios da Capital", 105, 29, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      // Configuração de alinhamento do bloco inicial
      const marginLeft = 10;
      const marginRight = 15;
      const totalWidth = 210 - marginLeft - marginRight; // 185 mm
      const labelWidth = 55;
      const valueWidth = totalWidth - labelWidth; // 130 mm
      const lineHeight = 7;
      const blockPadding = 3; // Espaçamento interno na caixa
      
      // O bloco inicial inicia em 42 mm (posição fixa)
      let currentY = 42; 
      
      // Adiciona um espaçamento interno para que "Data (s):" não fique tão próximo da linha superior do quadro
      let initialBlockContentTop = currentY + lineHeight; // Desloca o conteúdo 1 linha para baixo
      const initialBlockTop = currentY - blockPadding;
      let initialBlockContentY = initialBlockContentTop;

      initialBlockContentY = drawLabelValueBlock(doc, "Data (s):", data['inspection_date'] || "____", marginLeft, initialBlockContentY, labelWidth, valueWidth, lineHeight) + lineHeight;
      initialBlockContentY = drawLabelValueBlock(doc, "Fundamento legal:", data["fundamento"] || "Art. 66, VII, da Lei 7.210/84; Resolução CNJ Nº 593/2024 e arts. 883 e 884, I e IV, do Provimento COGER/TJAC Nº 16/2016.", marginLeft, initialBlockContentY, labelWidth, valueWidth, lineHeight) + lineHeight;
      initialBlockContentY = drawLabelValueBlock(doc, "Objetivos da inspeção:", data["objetivos"] || "Verificar o cumprimento de parâmetros referentes às condições de custódia, direitos e serviços que devem ser garantidos às pessoas privadas de liberdade, com difenciada atenção para aquelas com vulnerabilidades acrescidas, e adotar as providências cabíveis para sanar as irregularidades identificadas.", marginLeft, initialBlockContentY, labelWidth, valueWidth, lineHeight) + lineHeight;
      initialBlockContentY = drawLabelValueBlock(doc, "Unidades inspecionadas:", data['prison_unit'] || "____", marginLeft, initialBlockContentY, labelWidth, valueWidth, lineHeight) + lineHeight;

      // Configuração do novo estilo para o contorno: aumenta a espessura e utiliza uma cor mais escura para um visual mais profissional
      doc.setLineWidth(0.75);
      doc.setDrawColor(80, 80, 80);
      doc.rect(marginLeft - blockPadding, initialBlockTop, totalWidth + 2 * blockPadding, (initialBlockContentY - initialBlockTop) + blockPadding, 'D');

      // Atualiza currentY para após o bloco (com espaço adicional)
      currentY = initialBlockContentY + 10;

      // AutoTables para os itens inspecionados:
      doc.setFont("helvetica", "bold");
      doc.autoTable({
        head: [[ 'Aspectos gerais e monitoramento das providências já recomendadas pelo juízo da Execução Penal e pelo GMF', 'Status' ]],
        body: checklistItems.map((item, i) => {
          const status = data[`item_${i + 1}`] || "Não selecionado";
          return [item, status];
        }),
        startY: currentY,
        margin: { left: marginLeft },
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 }
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.setFont("helvetica", "bold");
      doc.autoTable({
        head: [[ 'Relatos individuais relevantes', 'Resposta' ]],
        body: humanitarianItems.map((item, i) => {
          const response = data[`humanitarian_item_${i + 1}`] || "Não selecionado";
          const obs = data[`humanitarian_obs_${i + 1}`] || "";
          return [item, response + (obs ? " - " + obs : "")];
        }),
        startY: currentY,
        margin: { left: marginLeft },
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 }
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.setFont("helvetica", "bold");
      doc.autoTable({
        head: [[ 'Averiguações de segurança', 'Resposta' ]],
        body: structuralItems.map((item, i) => {
          const response = data[`structural_item_${i + 1}`] || "Não selecionado";
          const obs = data[`structural_obs_${i + 1}`] || "";
          return [item, response + (obs ? " - " + obs : "")];
        }),
        startY: currentY,
        margin: { left: marginLeft },
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 }
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // Outros registros de responsabilidade
      doc.setFont("helvetica", "bold");
      doc.autoTable({
        head: [[ "Outros registros de responsabilidade da Presidência do IAPEN" ]],
        body: [[ data["other_records_presidencia"].trim() || "____" ]],
        startY: currentY,
        margin: { left: marginLeft },
        theme: "grid",
        headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 3 }
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.autoTable({
        head: [[ "Outros registros de responsabilidade da direção da unidade prisional" ]],
        body: [[ data["other_records_direcao"].trim() || "____" ]],
        startY: currentY,
        margin: { left: marginLeft },
        theme: "grid",
        headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 3 }
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // Bloco final dinâmico: Resumo dos achados (sem caixa e sem negrito)
      doc.setFont("helvetica", "normal");
      let section1Items = [];
      for (let i = 0; i < checklistItems.length; i++) {
        if (data[`item_${i+1}`] === "pendente") {
          section1Items.push("• " + checklistItems[i] + " (Resposta: Pendente)");
        }
      }
      for (let i = 0; i < structuralItems.length; i++) {
        if (data[`structural_item_${i+1}`] === "sim") {
          let obs = data[`structural_obs_${i+1}`] || "";
          section1Items.push("• " + structuralItems[i] + " (Resposta: Sim" + (obs ? " - Achados: " + obs : "") + ")");
        }
      }
      if (data["other_records_presidencia"].trim() !== "") {
        section1Items.push("• Outros registros de responsabilidade da Presidência do IAPEN: " + data["other_records_presidencia"].trim());
      }

      let section2Items = [];
      for (let i = 0; i < humanitarianItems.length; i++) {
        if (data[`humanitarian_item_${i+1}`] === "sim") {
          let obs = data[`humanitarian_obs_${i+1}`] || "";
          section2Items.push("• " + humanitarianItems[i] + " (Resposta: Sim" + (obs ? " - Achados: " + obs : "") + ")");
        }
      }
      if (data["other_records_direcao"].trim() !== "") {
        section2Items.push("• Outros registros de responsabilidade da direção da unidade prisional: " + data["other_records_direcao"].trim());
      }

      let finalText = "A partir das constatações, o MM Juiz da Vara de Execução de Penas no Regime Fechado, com espeque no art. 66, VII, da LEP, proferiu as seguintes determinações:\n\n";
      finalText += "1. Em vista das deficiências estruturais detectadas, oficie-se ao Diretor-Presidente do IAPEN, com os cumprimentos de estilo, remetendo-se cópia do presente termo de inspeção e requisitando informações, no prazo de 10 (dez) dias, sobre as providências em andamento para solução das seguintes questões:\n";
      finalText += section1Items.length > 0 ? section1Items.join("\n") + "\n\n" : "Nenhuma pendência/irregularidade identificada.\n\n";
      if (section2Items.length > 0) {
         finalText += "2. Em vista dos relatos individuais de possíveis violações a direitos, oficie-se à direção da unidade prisional pertinente, com os cumprimentos do juízo, remetendo-se cópia do presente termo de inspeção e requisitando providências, no prazo de 10 (dez) dias, para solução das seguintes questões:\n";
         finalText += section2Items.join("\n") + "\n";
      }
      finalText += "\nNão sendo apresentadas informações no prazo apontado, a secretaria deverá expedir o necessário para intimação pessoal do destinatário da ordem, consignando que a omissão ensejará as penalidades legais.\n\n";
      if (data["other_determinations_choice"] === "sim" && data["other_determinations"].trim() !== "") {
         finalText += data["other_determinations"].trim() + "\n\n";
      }
      finalText += "Com a resposta, voltem-me.\n\n";
      finalText += "Intime-se o Ministério Público para o que entender de direito.\n\n";
      finalText += "As informações de rotina atinentes à estrutura física das unidades prisionais, quantitativo de agentes, população carcerária, fugas, apreensões e outras intercorrências serão verificadas junto à direção, para informação padrão ao Conselho Nacional de Justiça e à Corregedoria Geral da Justiça.";

      const currentPageHeight = doc.internal.pageSize.getHeight();
      if (currentY > currentPageHeight - 40) {
         doc.addPage();
         currentY = 20;
      }
      // Desenha o bloco final sem caixa
      currentY = drawJustifiedTextBlock(doc, finalText, marginLeft, currentY, totalWidth, lineHeight);
      currentY += 10;

      // INSERÇÃO DAS FOTOS: Nova página para as fotos (6 por página)
      const imageFiles = document.getElementById('fotoInput').files;
      if (imageFiles.length > 0) {
        doc.addPage();
        const photosPerPage = 6;
        const gap = 5;
        const columns = 2;
        const rows = 3;
        const pageWidth = 210;
        const pageH = doc.internal.pageSize.getHeight();
        const imageWidth = (pageWidth - 2 * marginLeft - gap) / columns;
        const imageHeight = (pageH - 2 * marginLeft - 2 * gap) / rows;
        let photoCount = 0;
        for (let i = 0; i < imageFiles.length; i++) {
          try {
            const dataUrl = await readFileAsDataURL(imageFiles[i]);
            if (photoCount > 0 && photoCount % photosPerPage === 0) {
              doc.addPage();
            }
            let posIndex = photoCount % photosPerPage;
            let currentRow = Math.floor(posIndex / columns);
            let currentCol = posIndex % columns;
            let posX = marginLeft + currentCol * (imageWidth + gap);
            let posY = marginLeft + currentRow * (imageHeight + gap);
            doc.addImage(dataUrl, 'JPEG', posX, posY, imageWidth, imageHeight);
            photoCount++;
          } catch (error) {
            console.error("Erro ao ler a imagem:", error);
          }
        }
      }

      // Rodapé em todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
        // Removida a linha da data e atualizando o texto do rodapé
        doc.text("Assinatura do Juiz e data lançadas digitalmente", 195, 290, { align: 'right' });
      }

      doc.save("termo_inspecao.pdf");
      console.log("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    }
  });

  // Evento para Gerar DOC
  document.getElementById('generateDOC').addEventListener('click', function() {
    try {
      const form = document.getElementById('inspectionForm');
      const formData = new FormData(form);
      let data = {};
      formData.forEach((value, key) => {
        if (!key.endsWith("[]")) {
          data[key] = value;
        }
      });
      const rawDates = formData.getAll("inspection_date[]");
      const formattedDates = rawDates.map(formatDateStr).join(", ");
      data["inspection_date"] = formattedDates;
      data["prison_unit"] = formData.getAll("prison_unit[]").join(", ");
      data["other_records_presidencia"] = formData.get("other_records_presidencia") || "";
      data["other_records_direcao"] = formData.get("other_records_direcao") || "";
      data["other_determinations_choice"] = formData.get("other_determinations_choice") || "nao";
      data["other_determinations"] = formData.get("other_determinations") || "";

      // Monta o conteúdo DOC em HTML com formatação básica
      let html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                 "xmlns:w='urn:schemas-microsoft-com:office:word' " +
                 "xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Termo de Inspeção</title></head><body>";
      html += "<h1>Termo de Inspeção</h1>";
      html += "<p><strong>Data(s):</strong> " + data["inspection_date"] + "</p>";
      html += "<p><strong>Fundamento legal:</strong> " + data["fundamento"] + "</p>";
      html += "<p><strong>Objetivos da inspeção:</strong> " + data["objetivos"] + "</p>";
      html += "<p><strong>Unidades inspecionadas:</strong> " + data["prison_unit"] + "</p>";

      html += "<h2>Checklist de Inspeção</h2><ul>";
      checklistItems.forEach((item, i) => {
         let status = formData.get("item_" + (i+1)) || "Não selecionado";
         html += "<li>" + item + " - " + status + "</li>";
      });
      html += "</ul>";

      html += "<h2>Relatos Humanitários</h2><ul>";
      humanitarianItems.forEach((item, i) => {
         let resp = formData.get("humanitarian_item_" + (i+1)) || "Não selecionado";
         let obs = formData.get("humanitarian_obs_" + (i+1)) || "";
         html += "<li>" + item + " - " + resp;
         if (resp === "sim" && obs.trim() !== "") {
            html += " - " + obs;
         }
         html += "</li>";
      });
      html += "</ul>";

      html += "<h2>Questões Estruturais</h2><ul>";
      structuralItems.forEach((item, i) => {
         let resp = formData.get("structural_item_" + (i+1)) || "Não selecionado";
         let obs = formData.get("structural_obs_" + (i+1)) || "";
         html += "<li>" + item + " - " + resp;
         if (resp === "sim" && obs.trim() !== "") {
            html += " - " + obs;
         }
         html += "</li>";
      });
      html += "</ul>";

      html += "<h2>Outros registros de responsabilidade da Presidência do IAPEN</h2>";
      html += "<p>" + (data["other_records_presidencia"] || "____") + "</p>";
      html += "<h2>Outros registros de responsabilidade da direção da unidade prisional</h2>";
      html += "<p>" + (data["other_records_direcao"] || "____") + "</p>";

      if (data["other_determinations_choice"] === "sim" && data["other_determinations"].trim() !== "") {
         html += "<h2>Outras Determinações</h2>";
         html += "<p>" + data["other_determinations"].trim() + "</p>";
      }

      // Resumo dos Achados
      let section1Items = [];
      checklistItems.forEach((item, i) => {
         let status = formData.get("item_" + (i+1));
         if (status === "pendente") {
            section1Items.push("• " + item + " (Resposta: Pendente)");
         }
      });
      structuralItems.forEach((item, i) => {
         let status = formData.get("structural_item_" + (i+1));
         let obs = formData.get("structural_obs_" + (i+1)) || "";
         if (status === "sim") {
            section1Items.push("• " + item + " (Resposta: Sim" + (obs ? " - Achados: " + obs : "") + ")");
         }
      });
      if ((data["other_records_presidencia"] || "").trim() !== "") {
         section1Items.push("• Outros registros de responsabilidade da Presidência do IAPEN: " + data["other_records_presidencia"].trim());
      }
      let section2Items = [];
      humanitarianItems.forEach((item, i) => {
         let status = formData.get("humanitarian_item_" + (i+1));
         let obs = formData.get("humanitarian_obs_" + (i+1)) || "";
         if (status === "sim") {
            section2Items.push("• " + item + " (Resposta: Sim" + (obs ? " - Achados: " + obs : "") + ")");
         }
      });
      if ((data["other_records_direcao"] || "").trim() !== "") {
         section2Items.push("• Outros registros de responsabilidade da direção da unidade prisional: " + data["other_records_direcao"].trim());
      }

      html += "<h2>Resumo dos Achados</h2>";
      html += "<h3>Aspectos gerais e monitoramento das providências</h3>";
      if (section1Items.length > 0) {
         html += "<p>" + section1Items.join("<br>") + "</p>";
      } else {
         html += "<p>Nenhuma pendência/irregularidade identificada.</p>";
      }
      if (section2Items.length > 0) {
         html += "<h3>Relatos individuais relevantes</h3>";
         html += "<p>" + section2Items.join("<br>") + "</p>";
      }
      html += "<p>Não sendo apresentadas informações no prazo apontado, a secretaria deverá expedir o necessário para intimação pessoal do destinatário da ordem, consignando que a omissão ensejará as penalidades legais.</p>";
      html += "<p>Com a resposta, voltem-me.</p>";
      html += "<p>Intime-se o Ministério Público para o que entender de direito.</p>";
      html += "<p>As informações de rotina atinentes à estrutura física das unidades prisionais, quantitativo de agentes, população carcerária, fugas, apreensões e outras intercorrências serão verificadas junto à direção, para informação padrão ao Conselho Nacional de Justiça e à Corregedoria Geral da Justiça.</p>";
      html += "</body></html>";

      let blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      let url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = url;
      link.download = 'termo_inspecao.doc';
      link.click();
      document.body.removeChild(link);
      console.log("DOC gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar o DOC:", error);
    }
  });
  
  // Evento para Adicionar nova Data
  document.getElementById('addDate').addEventListener('click', function() {
    const container = document.querySelector('.info-section');
    const input = document.createElement('input');
    input.type = 'date';
    input.name = 'inspection_date[]';
    container.appendChild(document.createElement('br'));
    container.appendChild(input);
  });
});
