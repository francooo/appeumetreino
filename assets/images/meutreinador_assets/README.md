# Meu Treinador — pacote de recursos visuais

## Conteúdo
- `icons/`: ícones SVG independentes e editáveis, com traço configurável por `currentColor`.
- `components/`: exemplos SVG editáveis de botão primário/secundário, opção selecionada, faixa de métricas e linha de conta.
- `mockups/`: cinco imagens de referência da direção clara/editorial.
- `DESIGN_TOKENS.md`: paleta aproximada, tipografia e orientações de uso.

## Importante sobre a origem dos arquivos
Os mockups foram gerados como imagens rasterizadas e não continham arquivos-fonte separados de cada ícone ou elemento. Por isso, os SVGs deste pacote são recriações vetoriais editáveis e consistentes com a direção visual, não extrações exatas dos pixels originais. As ilustrações detalhadas de exercícios e a foto/preview de equipamento permanecem apenas nas imagens de referência; este pacote não inclui arquivos-fonte vetoriais originais dessas ilustrações/fotografias.

## Uso dos ícones
Os SVGs usam `stroke="currentColor"`. Em ferramentas que não suportam `currentColor`, substitua-o por uma cor explícita (por exemplo `#111318`, `#C7F000` ou `#315FE8`). Os ícones têm viewBox 24 × 24 e podem ser escalados sem perda de qualidade.

## Nota de implementação
Os valores de cor em `DESIGN_TOKENS.md` são aproximações de design para prototipação e devem ser validados em contraste, acessibilidade e aparelhos reais.
