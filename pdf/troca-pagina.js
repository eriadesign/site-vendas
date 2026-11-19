/* Troca uma página do "AUVP Escola.pdf" por outra impressa à parte, sem
   mexer no resto do arquivo.

   O PDF completo não tem fonte neste repositório; só a página do
   ecossistema tem (pdf/ecossistema.htm). Por isso a troca é feita dentro do
   próprio PDF: o objeto da página continua o mesmo (o índice da página 2
   aponta para ele pelo destino "ecossistema", e segue funcionando), só o
   conteúdo e os links dele são substituídos.

   Uso (na raiz do repositório):
     npm i --no-save --prefix "%TEMP%\pdflib" pdf-lib@1.17.1
     set NODE_PATH=%TEMP%\pdflib\node_modules
     node pdf/troca-pagina.js "AUVP Escola.pdf" pagina-nova.pdf 3
*/
const fs = require('fs');
const { PDFDocument, PDFName, PDFString, PDFDict, PDFArray, PDFRef } = require('pdf-lib');

async function main() {
  const [base, nova, num] = process.argv.slice(2);
  if (!base || !nova || !num) throw new Error('uso: node pdf/troca-pagina.js <pdf> <pagina-nova.pdf> <número da página>');
  const doc = await PDFDocument.load(fs.readFileSync(base), { updateMetadata: false });
  const fonte = await PDFDocument.load(fs.readFileSync(nova));
  const ctx = doc.context;

  const pagina = doc.getPage(Number(num) - 1);
  const [embutida] = await doc.embedPdf(fonte, [0]);

  // conteúdo e recursos antigos saem; a página nova entra como um bloco só
  pagina.node.set(PDFName.of('Contents'), ctx.obj([]));
  pagina.node.set(PDFName.of('Resources'), ctx.obj({}));
  pagina.drawPage(embutida, { x: 0, y: 0, width: pagina.getWidth(), height: pagina.getHeight() });

  // links: os da página nova, com a mesma área clicável
  const annots = fonte.getPage(0).node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  const links = [];
  if (annots) for (let i = 0; i < annots.size(); i++) {
    const a = annots.lookup(i, PDFDict);
    if (a.get(PDFName.of('Subtype')) !== PDFName.of('Link')) continue;
    const acao = a.lookupMaybe(PDFName.of('A'), PDFDict);
    const uri = acao && acao.lookup(PDFName.of('URI'));
    if (!uri) continue;
    const rect = a.lookup(PDFName.of('Rect'), PDFArray).asArray().map(n => n.asNumber());
    links.push(ctx.register(ctx.obj({
      Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri.decodeText ? uri.decodeText() : uri.asString()) },
    })));
  }
  pagina.node.set(PDFName.of('Annots'), ctx.obj(links));

  // a página nova só é embutida de fato no flush: antes dele a limpeza
  // abaixo apagaria a cópia que o embutir ainda vai ler
  await doc.flush();

  // o pdf-lib grava todo objeto que conhece: o que a página antiga usava e
  // ninguém mais aponta sai aqui, senão o arquivo carrega as duas versões
  const vivos = new Set();
  const visita = (o) => {
    if (o instanceof PDFRef) {
      if (vivos.has(o.tag)) return;
      vivos.add(o.tag);
      visita(ctx.lookup(o));
    } else if (o instanceof PDFDict) {
      for (const [, v] of o.entries()) visita(v);
    } else if (o instanceof PDFArray) {
      for (const v of o.asArray()) visita(v);
    } else if (o && o.dict instanceof PDFDict) {
      visita(o.dict); // streams
    }
  };
  visita(ctx.trailerInfo.Root);
  if (ctx.trailerInfo.Info) visita(ctx.trailerInfo.Info);
  let removidos = 0;
  for (const [ref] of ctx.enumerateIndirectObjects()) {
    if (!vivos.has(ref.tag)) { ctx.delete(ref); removidos++; }
  }

  fs.writeFileSync(base, await doc.save({ useObjectStreams: false }));
  console.log('página ' + num + ' trocada, ' + links.length + ' links, ' + removidos + ' objetos órfãos removidos');
}
main().catch(e => { console.error(e.message || e); process.exit(1); });
