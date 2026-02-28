import type { Equipment, Exercise, Level, Workout } from "./storage";

interface ExerciseTemplate {
  name: string;
  equipment: string;
  sets: { beginner: number; intermediate: number; advanced: number };
  reps: { beginner: string; intermediate: string; advanced: string };
  rest: { beginner: number; intermediate: number; advanced: number };
  instructions: string;
}

const EQUIPMENT_EXERCISES: Record<string, ExerciseTemplate[]> = {
  dumbbell: [
    {
      name: "Rosca Biceps",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, segurando um halter em cada mao com os bracos estendidos.\n2. Mantenha os cotovelos proximos ao corpo e as palmas viradas para frente.\n3. Inspire e, ao expirar, flexione os cotovelos levantando os halteres ate a altura dos ombros.\n4. Segure por 1 segundo no topo, contraindo o biceps.\n5. Desga lentamente ate a posicao inicial, controlando o movimento.\n6. Mantenha a postura ereta durante todo o exercicio, sem balançar o tronco.",
    },
    {
      name: "Desenvolvimento de Ombros",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Sente-se ou fique em pe com a coluna reta, segurando um halter em cada mao na altura dos ombros.\n2. As palmas devem estar viradas para frente, cotovelos a 90 graus.\n3. Inspire e, ao expirar, empurre os halteres para cima ate estender completamente os bracos.\n4. Nao trave os cotovelos no topo do movimento.\n5. Desga lentamente ate a posicao inicial.\n6. Mantenha o core ativado para proteger a coluna lombar.",
    },
    {
      name: "Remada Unilateral",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Apoie um joelho e a mao do mesmo lado em um banco, mantendo as costas paralelas ao chao.\n2. Segure o halter com a mao oposta, braco estendido para baixo.\n3. Inspire e, ao expirar, puxe o halter em direcao ao quadril, mantendo o cotovelo proximo ao corpo.\n4. Aperte as costas no topo do movimento por 1 segundo.\n5. Desga de forma controlada ate a posicao inicial.\n6. Complete todas as repeticoes de um lado antes de trocar.",
    },
    {
      name: "Agachamento com Halteres",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, segurando um halter em cada mao ao lado do corpo.\n2. Mantenha o peito erguido e o olhar para frente.\n3. Inspire e agache flexionando os joelhos e o quadril, como se fosse sentar em uma cadeira.\n4. Desga ate as coxas ficarem paralelas ao chao, mantendo os joelhos alinhados com os pes.\n5. Expire e empurre o chao para subir ate a posicao inicial.\n6. Mantenha os calcanhares no chao durante todo o movimento.",
    },
    {
      name: "Supino com Halteres",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Deite-se em um banco reto com um halter em cada mao, bracos estendidos acima do peito.\n2. Mantenha os pes firmes no chao e as escapulas retraidas.\n3. Inspire e desga os halteres lentamente ate os cotovelos ficarem a 90 graus.\n4. Expire e empurre os halteres para cima, estendendo os bracos sem travar os cotovelos.\n5. Mantenha o controle durante todo o movimento, sem deixar os halteres quicarem.\n6. Mantenha a curvatura natural da lombar sem arquear excessivamente.",
    },
    {
      name: "Elevacao Lateral",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, segurando um halter em cada mao ao lado do corpo.\n2. Mantenha uma leve flexao nos cotovelos durante todo o movimento.\n3. Inspire e, ao expirar, levante os bracos lateralmente ate a altura dos ombros.\n4. As palmas devem estar viradas para baixo no topo do movimento.\n5. Segure por 1 segundo e desga lentamente.\n6. Evite usar impulso do corpo; o movimento deve ser controlado e isolado nos ombros.",
    },
  ],
  barbell: [
    {
      name: "Supino Reto",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
      instructions: "1. Deite-se no banco com os olhos alinhados abaixo da barra.\n2. Segure a barra com as maos um pouco mais afastadas que a largura dos ombros.\n3. Retire a barra do suporte e posicione-a acima do peito com os bracos estendidos.\n4. Inspire e desga a barra ate tocar levemente o peito.\n5. Expire e empurre a barra para cima ate estender completamente os bracos.\n6. Mantenha as escapulas retraidas e os pes firmes no chao durante todo o movimento.",
    },
    {
      name: "Agachamento Livre",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
      instructions: "1. Posicione a barra sobre os trapezios (parte superior das costas), nao sobre o pescoco.\n2. Pes na largura dos ombros, pontas levemente viradas para fora.\n3. Inspire e agache controladamente, empurrando o quadril para tras.\n4. Desga ate as coxas ficarem paralelas ao chao ou um pouco abaixo.\n5. Mantenha o peito erguido, coluna neutra e joelhos apontando na direcao dos pes.\n6. Expire e suba de forma explosiva, empurrando o chao com os calcanhares.",
    },
    {
      name: "Remada Curvada",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, segurando a barra com pegada pronada.\n2. Incline o tronco para frente ate ficar quase paralelo ao chao, joelhos levemente flexionados.\n3. Deixe a barra pendurada com os bracos estendidos.\n4. Inspire e, ao expirar, puxe a barra em direcao ao abdomen.\n5. Aperte as escapulas no topo do movimento.\n6. Desga de forma controlada e repita. Mantenha a coluna neutra durante todo o exercicio.",
    },
    {
      name: "Desenvolvimento Militar",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, segurando a barra na altura dos ombros.\n2. Pegada um pouco mais afastada que a largura dos ombros, palmas para frente.\n3. Inspire e, ao expirar, empurre a barra para cima ate estender os bracos completamente.\n4. Mantenha o core ativado e evite inclinar o tronco para tras.\n5. Desga a barra de forma controlada ate a posicao inicial.\n6. Nao use impulso das pernas; o movimento deve ser isolado nos ombros.",
    },
  ],
  pullup_bar: [
    {
      name: "Barra Fixa",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "5", intermediate: "8", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
      instructions: "1. Segure a barra com pegada pronada (palmas para frente), maos afastadas na largura dos ombros.\n2. Comece com os bracos totalmente estendidos, corpo pendurado.\n3. Ative as escapulas puxando-as para baixo e para tras.\n4. Expire e puxe o corpo para cima ate o queixo ultrapassar a barra.\n5. Segure por 1 segundo no topo.\n6. Inspire e desga lentamente ate a posicao inicial. Evite balançar o corpo.",
    },
    {
      name: "Chin-up",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "5", intermediate: "8", advanced: "10" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
      instructions: "1. Segure a barra com pegada supinada (palmas viradas para voce), maos na largura dos ombros.\n2. Comece com os bracos estendidos, ombros relaxados.\n3. Expire e puxe o corpo para cima, focando na contracao dos biceps e costas.\n4. Suba ate o queixo ultrapassar a barra.\n5. Segure brevemente no topo e desga de forma controlada.\n6. Mantenha o core ativado e evite movimentos de balanco.",
    },
    {
      name: "Pendurado na Barra (Abs)",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Pendure-se na barra com os bracos estendidos, pegada na largura dos ombros.\n2. Mantenha o corpo estavel, sem balançar.\n3. Expire e levante os joelhos em direcao ao peito, contraindo o abdomen.\n4. Segure por 1 segundo com os joelhos elevados.\n5. Inspire e desga as pernas de forma controlada.\n6. Para maior dificuldade, levante as pernas esticadas em vez de flexionadas.",
    },
  ],
  resistance_band: [
    {
      name: "Puxada com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Prenda o elastico em um ponto alto (porta, barra ou gancho).\n2. Segure as extremidades com as maos, bracos estendidos acima da cabeça.\n3. Mantenha os pes na largura dos ombros e leve flexao nos joelhos.\n4. Expire e puxe o elastico para baixo em direcao ao peito, mantendo os cotovelos proximos ao corpo.\n5. Aperte as costas no final do movimento.\n6. Retorne lentamente a posicao inicial com controle.",
    },
    {
      name: "Rosca com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Pise no centro do elastico com ambos os pes.\n2. Segure as extremidades com as palmas viradas para frente.\n3. Mantenha os cotovelos fixos ao lado do corpo.\n4. Expire e flexione os cotovelos, puxando o elastico ate a altura dos ombros.\n5. Segure por 1 segundo no topo, sentindo a contracao dos biceps.\n6. Desga lentamente mantendo a tensao no elastico.",
    },
    {
      name: "Agachamento com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Pise no elastico com ambos os pes na largura dos ombros.\n2. Segure as extremidades na altura dos ombros ou ao lado do corpo.\n3. Inspire e agache controladamente, mantendo o peito erguido.\n4. Desga ate as coxas ficarem paralelas ao chao.\n5. Expire e suba, sentindo a resistencia do elastico aumentar.\n6. Mantenha os joelhos alinhados com os pes durante todo o movimento.",
    },
    {
      name: "Abduo com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Prenda o elastico em um ponto fixo na altura do peito.\n2. Fique de costas para o ponto de fixacao, segurando o elastico com ambas as maos.\n3. Pes afastados na largura dos ombros, joelhos levemente flexionados.\n4. Expire e empurre as maos para frente, estendendo os bracos contra a resistencia.\n5. Mantenha o core ativado e nao gire o tronco.\n6. Retorne lentamente a posicao inicial.",
    },
  ],
  bench: [
    {
      name: "Supino no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Deite-se no banco com as costas apoiadas e os pes firmes no chao.\n2. Segure os halteres ou barra acima do peito com os bracos estendidos.\n3. Mantenha as escapulas retraidas e o peito expandido.\n4. Inspire e desga o peso ate os cotovelos ficarem a 90 graus.\n5. Expire e empurre o peso para cima de forma controlada.\n6. Nao deixe os cotovelos abrirem demais para proteger os ombros.",
    },
    {
      name: "Step-up no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Fique em pe de frente para o banco, pes na largura dos quadris.\n2. Coloque um pe inteiro sobre o banco.\n3. Empurre com o calcanhar e suba ate estender completamente a perna de apoio.\n4. Traga o outro pe para cima do banco brevemente.\n5. Desga controladamente com o pe que subiu por ultimo.\n6. Alterne as pernas ou complete todas as repeticoes de um lado antes de trocar.",
    },
    {
      name: "Triceps no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Sente-se na borda do banco e coloque as maos ao lado do quadril, dedos para frente.\n2. Deslize o quadril para fora do banco, apoiando-se nos bracos.\n3. Mantenha as pernas esticadas ou flexionadas (mais facil).\n4. Inspire e flexione os cotovelos, descendo o corpo ate os cotovelos ficarem a 90 graus.\n5. Expire e empurre para cima ate estender os bracos.\n6. Mantenha as costas proximas ao banco durante todo o movimento.",
    },
  ],
  kettlebell: [
    {
      name: "Swing com Kettlebell",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "15", advanced: "20" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes um pouco mais afastados que a largura dos ombros.\n2. Segure o kettlebell com ambas as maos, bracos estendidos.\n3. Flexione levemente os joelhos e empurre o quadril para tras, balançando o kettlebell entre as pernas.\n4. Expire e projete o quadril para frente de forma explosiva, balançando o kettlebell ate a altura dos ombros.\n5. Deixe o kettlebell descer naturalmente, absorvendo o peso com o quadril.\n6. O movimento vem do quadril, nao dos bracos. Mantenha o core ativado.",
    },
    {
      name: "Goblet Squat",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Segure o kettlebell pela alça proximo ao peito, cotovelos apontando para baixo.\n2. Pes na largura dos ombros, pontas levemente viradas para fora.\n3. Inspire e agache controladamente, mantendo o peito erguido e o kettlebell proximo ao corpo.\n4. Desga ate as coxas ficarem paralelas ao chao ou mais abaixo.\n5. Use os cotovelos para empurrar os joelhos para fora se necessario.\n6. Expire e suba, empurrando o chao com os calcanhares.",
    },
    {
      name: "Clean & Press",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, kettlebell no chao entre os pes.\n2. Agache e segure o kettlebell com uma mao.\n3. Puxe o kettlebell para cima em um movimento fluido ate a posicao de rack (na frente do ombro).\n4. Sem pausa, empurre o kettlebell para cima ate estender completamente o braco.\n5. Desga o kettlebell de volta a posicao de rack e depois ao chao.\n6. Mantenha o core ativado durante todo o movimento. Alterne os lados.",
    },
    {
      name: "Turkish Get-up",
      equipment: "Kettlebell",
      sets: { beginner: 2, intermediate: 3, advanced: 4 },
      reps: { beginner: "3", intermediate: "5", advanced: "5" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Deite-se de costas segurando o kettlebell com o braco estendido para cima.\n2. Flexione o joelho do mesmo lado do kettlebell, pe apoiado no chao.\n3. Role para o lado oposto, apoiando-se no antebraço e depois na mao.\n4. Levante o quadril do chao formando uma ponte.\n5. Passe a perna esticada por baixo do corpo ate ficar em posicao de afundo.\n6. Levante-se completamente. Inverta o movimento para descer. Mantenha o olhar no kettlebell.",
    },
  ],
  mat: [
    {
      name: "Prancha",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "20s", intermediate: "30s", advanced: "45s" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Deite-se de brucos no colchonete.\n2. Apoie-se nos antebracos e nas pontas dos pes.\n3. Mantenha o corpo em linha reta da cabeça aos calcanhares.\n4. Ative o abdomen, contraia os gluteos e mantenha o quadril alinhado.\n5. Nao deixe o quadril subir ou descer.\n6. Respire normalmente durante toda a execucao. Mantenha o olhar para o chao.",
    },
    {
      name: "Abdominal",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Deite-se de costas no colchonete com os joelhos flexionados e pes apoiados no chao.\n2. Coloque as maos atras da cabeça ou cruzadas sobre o peito.\n3. Expire e eleve o tronco superior em direcao aos joelhos, contraindo o abdomen.\n4. Nao puxe o pescoco com as maos.\n5. Segure por 1 segundo no topo da contracao.\n6. Inspire e desga lentamente ate quase encostar as costas no chao. Mantenha a lombar apoiada.",
    },
    {
      name: "Flexao de Bracos",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "12", advanced: "20" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Apoie as maos no colchonete, um pouco mais afastadas que a largura dos ombros.\n2. Estenda as pernas para tras, apoiando-se nas pontas dos pes.\n3. Mantenha o corpo em linha reta da cabeça aos pes.\n4. Inspire e flexione os cotovelos, descendo o peito em direcao ao chao.\n5. Desga ate os cotovelos ficarem a 90 graus ou o peito quase tocar o chao.\n6. Expire e empurre o corpo para cima ate estender os bracos. Nao trave os cotovelos.",
    },
    {
      name: "Ponte de Gluteos",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Deite-se de costas no colchonete com os joelhos flexionados e pes apoiados no chao.\n2. Bracos ao lado do corpo, palmas viradas para baixo.\n3. Expire e levante o quadril do chao, contraindo os gluteos.\n4. Suba ate formar uma linha reta dos ombros aos joelhos.\n5. Segure por 2 segundos no topo, apertando os gluteos.\n6. Inspire e desga lentamente. Nao apoie o quadril completamente no chao entre as repeticoes.",
    },
  ],
  jump_rope: [
    {
      name: "Pular Corda (Basico)",
      equipment: "Corda",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "30s", intermediate: "45s", advanced: "60s" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Segure as alças da corda com as maos na altura do quadril.\n2. Mantenha os cotovelos proximos ao corpo, girando a corda com os punhos.\n3. Pule com os dois pes juntos, elevando-se apenas o suficiente para a corda passar.\n4. Aterrisse nas pontas dos pes, com os joelhos levemente flexionados.\n5. Mantenha o olhar para frente e a postura ereta.\n6. Respire de forma ritmica durante toda a execucao.",
    },
    {
      name: "Pular Corda (Duplo)",
      equipment: "Corda",
      sets: { beginner: 2, intermediate: 3, advanced: 4 },
      reps: { beginner: "20s", intermediate: "30s", advanced: "45s" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Comece com pulos basicos para pegar o ritmo.\n2. Gire a corda mais rapido usando os punhos e pule mais alto.\n3. A corda deve passar duas vezes sob os pes a cada pulo.\n4. Mantenha o core ativado e o corpo vertical.\n5. Aterrisse suavemente nas pontas dos pes.\n6. Se errar, retome o ritmo com pulos simples antes de tentar novamente.",
    },
  ],
  generic: [
    {
      name: "Burpees",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "5", intermediate: "10", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
      instructions: "1. Fique em pe com os pes na largura dos ombros.\n2. Agache e coloque as maos no chao a frente dos pes.\n3. Pule com os pes para tras, ficando em posicao de prancha.\n4. Faca uma flexao de bracos (opcional para iniciantes).\n5. Pule com os pes de volta proximo as maos.\n6. Salte para cima com os bracos estendidos acima da cabeça. Aterrisse suavemente e repita.",
    },
    {
      name: "Polichinelos",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "20", intermediate: "30", advanced: "40" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Fique em pe com os pes juntos e bracos ao lado do corpo.\n2. Salte abrindo as pernas lateralmente e, ao mesmo tempo, eleve os bracos acima da cabeça.\n3. As maos podem se tocar ou bater palma no topo.\n4. Salte novamente, voltando a posicao inicial com pes juntos e bracos ao lado.\n5. Mantenha um ritmo constante e aterrisse nas pontas dos pes.\n6. Respire de forma ritmica: inspire ao abrir, expire ao fechar.",
    },
    {
      name: "Agachamento Livre",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Fique em pe com os pes na largura dos ombros, pontas levemente viradas para fora.\n2. Estenda os bracos a frente para equilibrio ou coloque as maos atras da cabeça.\n3. Inspire e agache flexionando joelhos e quadril simultaneamente.\n4. Desga ate as coxas ficarem paralelas ao chao.\n5. Mantenha o peito erguido e a coluna neutra.\n6. Expire e suba empurrando o chao com os calcanhares. Mantenha os joelhos alinhados.",
    },
    {
      name: "Afundo",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
      instructions: "1. Fique em pe com os pes juntos, maos na cintura ou ao lado do corpo.\n2. De um passo largo a frente com uma perna.\n3. Flexione ambos os joelhos ate formarem angulos de 90 graus.\n4. O joelho de tras deve quase tocar o chao.\n5. Mantenha o tronco ereto e o peso distribuido entre as duas pernas.\n6. Empurre com o pe da frente para voltar a posicao inicial. Alterne as pernas.",
    },
  ],
};

const WORKOUT_NAMES = [
  "Treino Forca Total",
  "Treino Resistencia",
  "Treino Explosao",
  "Treino Funcional",
  "Treino Hipertrofia",
  "Treino Full Body",
  "Treino Core & Power",
  "Treino Circuito",
];

const EXERCISE_IMAGES: Record<string, string> = {
  "Rosca Biceps": require("@/assets/images/exercises/rosca-biceps.png"),
  "Desenvolvimento de Ombros": require("@/assets/images/exercises/desenvolvimento-ombros.png"),
  "Remada Unilateral": require("@/assets/images/exercises/remada-unilateral.png"),
  "Agachamento com Halteres": require("@/assets/images/exercises/agachamento-halteres.png"),
  "Supino com Halteres": require("@/assets/images/exercises/supino-halteres.png"),
  "Elevacao Lateral": require("@/assets/images/exercises/elevacao-lateral.png"),
  "Supino Reto": require("@/assets/images/exercises/supino-reto.png"),
  "Agachamento Livre": require("@/assets/images/exercises/agachamento-livre.png"),
  "Remada Curvada": require("@/assets/images/exercises/remada-curvada.png"),
  "Desenvolvimento Militar": require("@/assets/images/exercises/desenvolvimento-militar.png"),
  "Barra Fixa": require("@/assets/images/exercises/barra-fixa.png"),
  "Chin-up": require("@/assets/images/exercises/chin-up.png"),
  "Pendurado na Barra (Abs)": require("@/assets/images/exercises/pendurado-barra.png"),
  "Puxada com Elastico": require("@/assets/images/exercises/puxada-elastico.png"),
  "Rosca com Elastico": require("@/assets/images/exercises/rosca-elastico.png"),
  "Agachamento com Elastico": require("@/assets/images/exercises/agachamento-elastico.png"),
  "Abduo com Elastico": require("@/assets/images/exercises/abduo-elastico.png"),
  "Supino no Banco": require("@/assets/images/exercises/supino-banco.png"),
  "Step-up no Banco": require("@/assets/images/exercises/step-up-banco.png"),
  "Triceps no Banco": require("@/assets/images/exercises/triceps-banco.png"),
  "Swing com Kettlebell": require("@/assets/images/exercises/swing-kettlebell.png"),
  "Goblet Squat": require("@/assets/images/exercises/goblet-squat.png"),
  "Clean & Press": require("@/assets/images/exercises/clean-press.png"),
  "Turkish Get-up": require("@/assets/images/exercises/turkish-getup.png"),
  "Prancha": require("@/assets/images/exercises/prancha.png"),
  "Abdominal": require("@/assets/images/exercises/abdominal.png"),
  "Flexao de Bracos": require("@/assets/images/exercises/flexao-bracos.png"),
  "Ponte de Gluteos": require("@/assets/images/exercises/ponte-gluteos.png"),
  "Pular Corda (Basico)": require("@/assets/images/exercises/pular-corda-basico.png"),
  "Pular Corda (Duplo)": require("@/assets/images/exercises/pular-corda-duplo.png"),
  "Burpees": require("@/assets/images/exercises/burpees.png"),
  "Polichinelos": require("@/assets/images/exercises/polichinelos.png"),
  "Afundo": require("@/assets/images/exercises/afundo.png"),
};

export function getExerciseImage(name: string): number | null {
  return EXERCISE_IMAGES[name] || null;
}

function detectEquipmentType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("halter") || lower.includes("dumbbell")) return "dumbbell";
  if (lower.includes("barra") && !lower.includes("pullup"))  return "barbell";
  if (lower.includes("pullup") || lower.includes("barra fixa")) return "pullup_bar";
  if (lower.includes("elastic") || lower.includes("band") || lower.includes("faixa")) return "resistance_band";
  if (lower.includes("banco") || lower.includes("bench")) return "bench";
  if (lower.includes("kettle")) return "kettlebell";
  if (lower.includes("colchonete") || lower.includes("mat") || lower.includes("tapete")) return "mat";
  if (lower.includes("corda") || lower.includes("rope")) return "jump_rope";
  return "generic";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateWorkout(
  equipment: Equipment[],
  level: Level,
): Workout {
  const exercisePool: ExerciseTemplate[] = [];
  const detectedTypes = new Set<string>();

  for (const eq of equipment) {
    const type = detectEquipmentType(eq.name);
    if (!detectedTypes.has(type)) {
      detectedTypes.add(type);
      const templates = EQUIPMENT_EXERCISES[type] || EQUIPMENT_EXERCISES.generic;
      exercisePool.push(...templates);
    }
  }

  if (exercisePool.length === 0) {
    exercisePool.push(...EQUIPMENT_EXERCISES.generic);
  }

  const shuffled = shuffle(exercisePool);
  const maxExercises = level === "beginner" ? 5 : level === "intermediate" ? 6 : 8;
  const selected = shuffled.slice(0, Math.min(maxExercises, shuffled.length));

  const exercises: Exercise[] = selected.map((t) => {
    const sets = t.sets[level];
    const repsStr = t.reps[level];
    const restSeconds = t.rest[level];
    const repTime = repsStr.includes("s") ? parseInt(repsStr) : parseInt(repsStr) * 3;
    const duration = sets * (repTime + restSeconds);
    return {
      name: t.name,
      sets,
      reps: repsStr,
      equipment: t.equipment,
      restSeconds,
      instructions: t.instructions,
      mediaUrl: "",
      duration,
    };
  });

  const totalMinutes = exercises.reduce((sum, e) => {
    const repTime = e.reps.includes("s") ? parseInt(e.reps) : parseInt(e.reps) * 3;
    return sum + e.sets * (repTime + e.restSeconds);
  }, 0);

  const durationMin = Math.round(totalMinutes / 60);

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  return {
    id,
    name: WORKOUT_NAMES[Math.floor(Math.random() * WORKOUT_NAMES.length)],
    exercises,
    level,
    createdAt: Date.now(),
    duration: `${durationMin} min`,
  };
}

export const EQUIPMENT_OPTIONS = [
  { key: "dumbbell", label: "Halteres", icon: "fitness" as const },
  { key: "barbell", label: "Barra", icon: "barbell" as const },
  { key: "pullup_bar", label: "Barra Fixa", icon: "body" as const },
  { key: "resistance_band", label: "Elastico", icon: "pulse" as const },
  { key: "bench", label: "Banco", icon: "bed" as const },
  { key: "kettlebell", label: "Kettlebell", icon: "bowling-ball" as const },
  { key: "mat", label: "Colchonete", icon: "layers" as const },
  { key: "jump_rope", label: "Corda", icon: "flash" as const },
] as const;
