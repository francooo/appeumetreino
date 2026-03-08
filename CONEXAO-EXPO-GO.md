# Conexão do app no Expo Go (celular)

Quando o celular mostra **"Failed to connect to 192.168.18.149:5000"**, o app não consegue falar com a API no seu PC. Siga este checklist:

## 1. Servidor da API rodando

No PC, na pasta do projeto:

```bash
npm run server:dev
```

Ou: `$env:NODE_ENV="development"; npx tsx server/index.ts`

Deve aparecer no terminal: **"express server serving on port 5000"**.

## 2. Mesma rede Wi‑Fi

- PC e celular na **mesma rede** (mesmo Wi‑Fi; não use “Visitantes” ou 5G em um e 2.4G no outro de forma que não se enxerguem).
- Se o PC estiver no cabo e o celular no Wi‑Fi, ambos precisam estar na mesma rede (mesmo roteador).

## 3. IP do PC

O app usa o mesmo IP que o Metro (Expo). Para conferir o IP do PC no Windows (PowerShell):

```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^192\.168\.' }).IPAddress
```

Use o IP que aparecer (ex.: `192.168.18.149`). Se o IP mudar (DHCP), o Expo Go passa a usar o novo automaticamente ao reconectar.

## 4. Firewall do Windows (causa comum)

O Firewall pode estar bloqueando a **porta 5000** (API) ou **8081/8082** (Metro).

**É obrigatório abrir o PowerShell como Administrador.** Se não abrir como admin, aparecerá "Acesso negado".

**Passos:**

1. Feche o PowerShell atual.
2. **Menu Iniciar** → digite **PowerShell**.
3. **Clique com o botão direito** em **Windows PowerShell**.
4. Escolha **"Executar como administrador"**.
5. No novo PowerShell (janela com título "Administrador"):
   ```powershell
   cd "C:\Users\franc\Downloads\appeumetreino 0803\appeumetreino"
   .\scripts\liberar-firewall-expo.ps1
   ```

Se aparecer "Regra criada" para as portas 5000, 8081 e 8082, está certo. Se aparecer de novo "Acesso negado", o Windows não está executando como administrador.

---

## Solução sem Firewall (tunnel para a API)

Se você **não puder** rodar o script do firewall como Administrador, use um **tunnel** para a API. Assim o celular acessa a API pela internet e o firewall deixa de bloquear.

**Passos:**

1. **Suba a API** (em um terminal):
   ```bash
   npm run server:dev
   ```
   Deixe esse terminal aberto.

2. **Em outro terminal**, crie o tunnel para a porta 5000:
   ```bash
   npm run tunnel:api
   ```
   Vai abrir o **ngrok** e mostrar uma URL, por exemplo:  
   `https://abc123.ngrok-free.app`

3. **Copie só o domínio** (ex.: `abc123.ngrok-free.app`, sem `https://`).

4. **No arquivo `.env`** na raiz do projeto, adicione ou altere:
   ```env
   EXPO_PUBLIC_DOMAIN=abc123.ngrok-free.app
   ```
   (use o domínio que o ngrok mostrou)

5. **Recarregue o app no Expo Go** (sacudir o celular → Reload, ou fechar e abrir de novo a URL do Expo). O app passa a usar essa URL para a API.

6. **Mantenha os dois terminais abertos** enquanto usar o app: um com `npm run server:dev` e outro com `npm run tunnel:api`.

**Observação:** A URL do ngrok muda cada vez que você roda `npm run tunnel:api` (em conta gratuita). Se mudar, atualize o `EXPO_PUBLIC_DOMAIN` no `.env` e recarregue o app.

---

## 5. Conferir se a API responde no PC

No navegador do **próprio PC**, abra:

- `http://192.168.18.149:5000`  
  (troque pelo seu IP se for outro)

Se não abrir, o servidor não está acessível na rede (por exemplo, ainda bloqueado pelo firewall ou servidor não rodando).

---

**Resumo:** Garanta que o servidor está rodando (porta 5000), que PC e celular estão na mesma Wi‑Fi e que o Firewall permite conexões de entrada na porta 5000 (e, se usar LAN, 8081/8082). O script `scripts/liberar-firewall-expo.ps1` libera essas portas na rede privada.
