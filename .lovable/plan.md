

## Plano: Ignorar alerta "Leaked Password Protection"

### Contexto
A configuração "Leaked Password Protection" (proteção contra senhas vazadas) nao esta disponivel no painel de configuracoes de autenticacao do Lovable Cloud. Nao existe opcao para habilitar essa funcionalidade, portanto nao e possivel resolver esse alerta.

### Acao
Marcar o finding de seguranca "Leaked Password Protection Disabled" como **ignorado**, com a justificativa de que a funcionalidade nao esta disponivel na plataforma Lovable Cloud.

### Detalhes tecnicos
- Usar a ferramenta `manage_security_finding` com operacao `update`
- Definir `ignore: true` e `ignore_reason` explicando a limitacao da plataforma
- Nenhuma alteracao de codigo sera necessaria

