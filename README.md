# Recicla+

Plataforma web interativa para localização de pontos de recolha de resíduos e promoção de práticas de reciclagem sustentáveis.

O **Recicla+** é um protótipo desenvolvido no âmbito de um projecto académico na área da Programação Informática. O sistema demonstra como tecnologias web modernas, serviços cloud e integração com dispositivos de geolocalização podem ser articulados para criar uma solução digital orientada para a sustentabilidade urbana.

O projecto tem como foco principal:

- Facilitar a localização de pontos de recolha;
- Disponibilizar informação educativa sobre separação de resíduos;
- Simular um sistema de acompanhamento e recompensa;
- Demonstrar integração entre frontend, backend e hardware IoT.

---

## Visão Geral da Solução

O Recicla+ consiste numa aplicação web desenvolvida com arquitetura modular, composta por:

- Interface reativa em SolidJS (TypeScript);
- Integração com Google Maps para visualização geográfica;
- Backend baseado em Supabase (PostgreSQL);
- Simulação de comunicação com um dispositivo GNSS (ESP32).

A aplicação permite ao utilizador:

- Criar conta e iniciar sessão;
- Consultar um mapa interativo com pontos de recolha;
- Aceder a um guia educativo;
- Visualizar estatísticas simuladas num dashboard.

O sistema foi concebido como protótipo funcional, demonstrando a viabilidade técnica da solução.

---

## Arquitetura Técnica

### Frontend

- **Framework:** SolidJS (TypeScript)
- **Bundler:** Vite
- **Estilização:** TailwindCSS
- **Mapas:** Google Maps JavaScript API

A aplicação segue boas práticas de reatividade (signals, memos e controlo declarativo de rendering), evitando mutações imperativas desnecessárias.

A estrutura está organizada por módulos funcionais, favorecendo:

- Separação de responsabilidades;
- Escalabilidade futura;
- Manutenção simplificada.

---

### Backend

- **Supabase (PostgreSQL)**
- Autenticação de utilizadores
- Persistência de dados (coordenadas, estatísticas simuladas)

O backend é utilizado como Backend-as-a-Service, reduzindo a necessidade de infraestrutura dedicada e permitindo foco na lógica da aplicação.

---

### Integração IoT (Simulação)

O projecto inclui a utilização de um módulo baseado em **ESP32 com GNSS integrado**, usado para recolha de coordenadas geográficas.

Fluxo simplificado:

1. O dispositivo recolhe latitude e longitude;
2. As coordenadas são enviadas para o backend;
3. O frontend consulta os dados;
4. A localização é apresentada no mapa interativo.

Esta componente demonstra a comunicação entre hardware físico e sistema web.

---

## Estrutura do Projecto (nível elevado)

```
src/
 ├── components/          # Componentes reutilizáveis
 ├── modules/             # Funcionalidades organizadas por domínio
 ├── routes/              # Páginas da aplicação
 ├── shared/              # Infraestrutura partilhada (ex.: Supabase)
 └── map/                 # Lógica relacionada com mapas
public/
supabase/
```

A organização privilegia separação por domínio funcional em vez de separação puramente técnica.

---

## Requisitos

- Node.js >= 22
- pnpm
- Chave válida da Google Maps API
- (Opcional) Projeto Supabase configurado

---

## Instalação

Clonar o repositório:

```bash
git clone https://github.com/brg-6332-ui/ReciclaMais.git
cd ReciclaMais
```

Instalar dependências:

```bash
pnpm install
```

Criar ficheiro `.env` na raiz do projecto:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id

VITE_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Executar em modo desenvolvimento:

```bash
pnpm dev
```

Build para produção:

```bash
pnpm build
pnpm preview
```

---

## Validação e Qualidade

Comandos disponíveis:

```bash
pnpm run type-check
pnpm run lint
pnpm run check
```

A aplicação foi validada quanto a:

- Navegação e fluxo de autenticação;
- Responsividade;
- Integração com Google Maps;
- Persistência de dados simulados.

---

## Estado do Projecto

Este repositório corresponde a um **protótipo funcional académico**, concebido para demonstrar integração tecnológica e viabilidade de solução.

Possíveis evoluções futuras:

- Integração real com máquinas de recolha automatizadas;
- Sistema de recompensas operacional;
- Aplicação mobile dedicada;
- Expansão geográfica.

---

## Licença

MIT License.
