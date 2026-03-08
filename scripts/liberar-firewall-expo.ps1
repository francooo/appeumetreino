# Libera as portas do Expo e da API no Firewall do Windows (rede privada).
# OBRIGATORIO: Abra o PowerShell como Administrador antes de executar.
#   Como fazer: Menu Iniciar -> digite "PowerShell" -> clique direito -> "Executar como administrador"

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host ""
  Write-Host "ACESSO NEGADO: este script precisa ser executado como Administrador." -ForegroundColor Red
  Write-Host ""
  Write-Host "Passos:" -ForegroundColor Yellow
  Write-Host "  1. Feche este PowerShell."
  Write-Host "  2. Menu Iniciar -> digite 'PowerShell'."
  Write-Host "  3. Clique com o BOTAO DIREITO em 'Windows PowerShell'."
  Write-Host "  4. Escolha 'Executar como administrador'."
  Write-Host "  5. No novo PowerShell, va ate a pasta do projeto:"
  Write-Host "     cd 'C:\Users\franc\Downloads\appeumetreino 0803\appeumetreino'"
  Write-Host "  6. Execute: .\scripts\liberar-firewall-expo.ps1"
  Write-Host ""
  exit 1
}

$ports = @(5000, 8081, 8082)  # API + Metro Bundler
foreach ($port in $ports) {
  $ruleName = "Expo/API Port $port"
  $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Regra '$ruleName' ja existe. OK."
  } else {
    try {
      New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -Profile Private
      Write-Host "Regra criada: $ruleName (porta $port)."
    } catch {
      Write-Host "Erro ao criar regra para porta $port : $_" -ForegroundColor Red
    }
  }
}
Write-Host ""
Write-Host "Pronto. Celular e PC na mesma rede Wi-Fi devem conseguir conectar na API (5000) e no Metro (8081/8082)."
