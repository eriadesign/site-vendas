# site-vendas

Apresentação navegável da **AUVP Escola**. É um arquivo único, `index.htm`,
com as imagens, vídeos e logos ao lado. Não tem build nem dependência: basta
abrir o `index.htm` no navegador.

Navegação: setas `←` `→` entre seções, `H` ou `Esc` para a Home. O menu lateral
abre pelo ícone ☰ no canto superior esquerdo (basta passar o mouse); as teclas
de 1 a 9 levam direto a cada seção, na ordem do menu. O guia em PDF (`AUVP Escola.pdf`)
pode ser baixado pelo botão "Baixar PDF" do menu lateral.

## PDF de download

O `AUVP Escola.pdf` (10 páginas, visual escuro) veio pronto do site-vendas-v2
e **não tem a fonte completa neste repositório**. Só a página 3, a do
ecossistema, tem fonte: `pdf/ecossistema.htm`. Ela é impressa sozinha e
trocada dentro do PDF, sem mexer nas outras páginas (o índice da página 2
continua levando até ela).

Para mudar o ecossistema, edite `pdf/ecossistema.htm` e rode no PowerShell, a
partir da pasta do repositório:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --no-pdf-header-footer --virtual-time-budget=15000 "--print-to-pdf=$env:TEMP\eco.pdf" "$PWD\pdf\ecossistema.htm"
npm i --no-save --prefix "$env:TEMP\pdflib" pdf-lib@1.17.1
$env:NODE_PATH = "$env:TEMP\pdflib\node_modules"
node pdf/troca-pagina.js "AUVP Escola.pdf" "$env:TEMP\eco.pdf" 3
```

O `pdf/guia-auvp-escola.htm` (e o `AUVP Escola - 2026.pdf` gerado dele) é a
versão anterior do guia, em fundo claro. O site não aponta mais para ele.

## Versões

| Versão | Onde está | Commit |
| --- | --- | --- |
| **V1** — snapshot de 16/09/2026 | branch `v1` | `8faf9a8` |
| Em desenvolvimento | branch `main` | segue adiante |

A branch **`v1`** é um ponto de retorno congelado, guardado antes da rodada de
mudanças seguinte. Ela não recebe commits: todo trabalho novo vai para a `main`.

### O que a V1 contém

- **11 seções**: Home, Quem somos nós?, O Ecossistema AUVP, A Escola, Dinâmica
  das aulas, Módulos do treinamento, Materiais de apoio, Ferramentas, Lives
  comunidade e app, Calculadoras e Boas-vindas.
- **Ecossistema** com os 7 produtos em anel, o card da Escola em destaque e os
  cards abrindo como painel, com a logo do produto.
- **Calculadoras** com as quatro em destaque em cards dourados de cor cheia,
  cada uma com link próprio.
- **Cronograma** com 12 módulos.
- **Logos dos produtos vetorizadas**, sem depender de fonte instalada na
  máquina de quem abre.

### Como voltar à V1

Para só olhar, sem mexer em nada:

- No GitHub, trocar a branch para `v1` e abrir o `index.htm`.
- Ou baixar tudo pronto:
  <https://github.com/ProdutosAUVP/site-vendas/archive/refs/heads/v1.zip>

Com o repositório na máquina:

```bash
git fetch origin
git checkout v1        # olhar a V1
git checkout main      # voltar para a versão em desenvolvimento
```

Para trazer a V1 inteira de volta como versão corrente, criando um commit que
desfaz tudo que veio depois — sem apagar o histórico:

```bash
git checkout main
git rm -rq --ignore-unmatch .   # tira o que existe hoje
git checkout origin/v1 -- .     # traz tudo que a V1 tinha
git commit -m "Volta a apresentação para a V1"
```
