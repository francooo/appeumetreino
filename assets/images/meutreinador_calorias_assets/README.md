# Meu Treinador — tela Medidor de calorias

Pacote com os recursos de referência e os principais elementos reutilizáveis desta tela.

## Estrutura
- `referencia/tela_medidor_de_calorias.png`: mockup completo (1440 × 2560 px).
- `icons_svg/`: 20 ícones SVG editáveis (alimentos, câmera, calendário, escala, gráfico, navegação e ações).
- `componentes_svg/`: exemplos editáveis da faixa de data, cartão de consumo e progresso de calorias, botão de foto, linha de refeição, cartão de peso e barra de navegação.
- `design_tokens.json`: cores e parâmetros sugeridos.

## Observação de origem
O mockup original é uma imagem rasterizada e não inclui arquivos-fonte separados para cada objeto. Os SVGs deste ZIP são recriações vetoriais editáveis que acompanham a composição visual; não são extrações exatas dos pixels do mockup. A foto da refeição, o avatar e os pequenos detalhes ilustrativos aparecem apenas dentro da imagem de referência.

## Uso dos SVG
Os ícones usam `currentColor` para o traço e `viewBox` 24 × 24. Substitua `currentColor` por uma cor explícita se a ferramenta de destino não oferecer suporte. Os componentes SVG são exemplos de layout que podem ser adaptados ao sistema da aplicação.
