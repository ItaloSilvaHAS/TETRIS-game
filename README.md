# 🎮 Tetris Desktop Game

Um jogo Tetris moderno e visualmente impressionante construído com Electron e tecnologias web. Apresenta animações suaves, efeitos de partículas, sistema de pontuação completo e uma interface bonita com gradientes animados.

![Tetris Game Preview](https://img.shields.io/badge/Game-Tetris-blue?style=for-the-badge&logo=electron)

## ✨ Funcionalidades

- **Interface Visual Moderna**: Menu principal com animações de gradiente e efeitos 3D
- **Efeitos Visuais Avançados**: 
  - Partículas quando peças caem e linhas são eliminadas
  - Animações de tremor na tela para ações importantes
  - Flash branco quando linhas são completadas
  - Peças fantasma para preview da posição final
- **Jogabilidade Completa**:
  - Todas as 7 peças clássicas do Tetris (I, O, T, S, Z, J, L)
  - Rotação de peças com wall-kick
  - Soft drop e hard drop
  - Sistema de níveis com velocidade progressiva
  - Pontuação com bônus para Tetris (4 linhas simultâneas)
- **Sistema de Configurações**:
  - Volume de música e efeitos sonoros
  - Nível inicial configurável
  - Persistência de configurações no LocalStorage
- **High Scores**: Sistema de recordes locais com data
- **Controles Responsivos**: Suporte a teclado com repetição de teclas
- **Pausa**: Sistema completo de pausa com overlay

## 🛠️ Tecnologias Utilizadas

### Frontend & Interface
- **HTML5**: Estrutura da aplicação com Canvas para renderização do jogo
- **CSS3**: Estilização avançada com gradientes animados, backdrop-filter, e transformações 3D
- **JavaScript ES6+**: Lógica do jogo com classes, modules e APIs modernas

### Desktop Framework
- **Electron**: Criação de aplicativo desktop multiplataforma
- **Node.js**: Runtime JavaScript para o processo principal

### Recursos Visuais
- **HTML5 Canvas**: Renderização em tempo real do jogo e efeitos visuais
- **Web Animations API**: Animações suaves e efeitos de transição
- **CSS Gradients**: Backgrounds animados e efeitos de iluminação
- **Particle System**: Sistema customizado de partículas para efeitos visuais

### Armazenamento
- **LocalStorage API**: Persistência de configurações e high scores

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

### Node.js
1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS (recomendada)
3. Execute o instalador seguindo as instruções
4. Verifique a instalação:
```bash
node --version
npm --version
```

## 🚀 Como Executar

### 1. Clone ou Baixe o Projeto
```bash
git clone <url-do-repositorio>
cd tetris-electron-game
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Instale o Electron (se não instalado globalmente)
```bash
npm install electron --save-dev
```

### 4. Execute o Jogo
```bash
npm start
```

ou diretamente com Electron:
```bash
npx electron main.js
```

## 🎮 Controles

### Movimento das Peças
- **← / A**: Mover para esquerda
- **→ / D**: Mover para direita  
- **↓ / S**: Soft drop (queda rápida com pontos bônus)
- **↑ / W**: Rotacionar peça no sentido horário
- **SPACE**: Hard drop (queda instantânea)

### Controles do Jogo
- **P**: Pausar/Despausar
- **ESC**: Pausar ou voltar ao menu
- **ENTER**: Iniciar jogo no menu principal

### Menu Electron
- **Ctrl/Cmd + N**: Novo jogo
- **SPACE**: Pausar/Despausar (quando em jogo)

## 📁 Estrutura do Projeto

```
tetris-electron-game/
├── main.js              # Processo principal do Electron
├── index.html           # Interface HTML com todas as telas
├── styles.css           # Estilos com animações e efeitos visuais
├── tetris.js           # Lógica central do jogo Tetris
├── game.js             # Renderização e efeitos visuais
├── renderer.js         # Gerenciamento de UI e eventos
├── package.json        # Configuração do projeto Node.js
└── README.md           # Este arquivo
```

### Arquitetura do Código

#### `main.js` - Processo Principal Electron
- Criação e gerenciamento da janela da aplicação
- Menu nativo da aplicação
- Configurações de segurança e performance

#### `tetris.js` - Engine do Jogo
- Classe `TetrisGame` com toda a lógica do Tetris
- Gerenciamento do tabuleiro e peças
- Sistema de pontuação e níveis
- Detecção de colisões e line clearing

#### `game.js` - Renderização Visual
- Classe `GameRenderer` para rendering no Canvas
- Sistema de partículas customizado
- Efeitos visuais (flash, tremor, ghost piece)
- Animações suaves e transições

#### `renderer.js` - Interface do Usuário
- Classe `TetrisApp` para gerenciamento de telas
- Sistema de configurações e persistência
- Event handling e navegação entre menus
- Integration com o processo principal do Electron

#### `styles.css` - Design Visual
- Design responsivo e moderno
- Animações CSS complexas
- Gradientes animados e efeitos 3D
- Temas visuais consistentes

## 🎯 Sistema de Pontuação

- **Movimento**: Sem pontos
- **Soft Drop**: 1 ponto por célula
- **Hard Drop**: 2 pontos por célula
- **Line Clear**:
  - 1 linha: 40 × nível
  - 2 linhas: 100 × nível
  - 3 linhas: 300 × nível
  - 4 linhas (Tetris): 1200 × nível × 2 (bônus duplo!)

## 🏆 Sistema de Níveis

- Cada 10 linhas completadas = próximo nível
- Velocidade aumenta progressivamente
- Nível inicial configurável nas opções
- Velocidade mínima: 50ms entre drops

## 💾 Persistência de Dados

O jogo salva automaticamente:
- **High Scores**: Top 10 pontuações com data
- **Configurações**: Volume, nível inicial
- **Dados armazenados**: LocalStorage do navegador

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm start          # Executa o jogo
npm install        # Instala dependências
```

### Customização
O jogo foi projetado para ser facilmente customizável:
- Cores das peças em `tetris.js`
- Animações e efeitos em `styles.css` e `game.js`
- Configurações de velocidade e pontuação em `tetris.js`

## 🐛 Solução de Problemas

### O jogo não inicia
1. Verifique se o Node.js está instalado corretamente
2. Execute `npm install` para instalar dependências
3. Tente `npm install electron --save-dev` se o Electron não foi instalado

### Performance baixa
1. Feche outros aplicativos pesados
2. O jogo usa animações intensivas - reduza outros processos
3. Verifique se há aceleração de hardware disponível

### Problemas de áudio
- As configurações de volume estão no menu Settings
- Recursos de áudio preparados mas não implementados (estrutura presente)

## 📝 Notas do Desenvolvedor

Este projeto demonstra o poder das tecnologias web modernas para criação de jogos desktop. Combina a flexibilidade do desenvolvimento web com a robustez de aplicações nativas através do Electron.

### Principais Destaques Técnicos:
- Sistema de renderização optimizado com Canvas
- Arquitetura orientada a objetos modular
- Efeitos visuais avançados sem bibliotecas externas
- Performance otimizada para 60 FPS
- Design responsivo e acessível

---

**Divirta-se jogando! 🎮**