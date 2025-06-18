
# 📚 QuizComponent - Angular Learning App

Este componente (`QuizComponent`) é responsável por gerenciar toda a lógica de execução de quizzes dentro da aplicação, incluindo:

- Exibição de perguntas
- Seleção de respostas
- Submissão de respostas
- Cálculo de pontuação
- Revisão de questões via IA (Assistente Virtual)
- Feedback de acerto/erro ao aluno
- Emissão de evento de conclusão

---

## 🚀 Estrutura do Componente

### Principais funções:

| Método | Responsabilidade |
|---|---|
| `handleOptionSelect()` | Salva a opção que o usuário escolheu |
| `handleSubmitAnswer()` | Avança para a próxima pergunta ou finaliza o quiz |
| `sendQuizResults()` | Envia o gabarito para o backend (AtividadeService) |
| `calculateScore()` (via Strategy) | Calcula a nota do aluno usando a estratégia de pontuação |
| `handleReviewQuestion()` | Chama a Assistente Virtual (IA) para gerar uma explicação da resposta |
| `handleFinishQuiz()` | Finaliza o quiz e emite evento com o resultado (aprovado ou não) |
| `isCorrect()` | Verifica se a resposta de uma questão está correta |

---

## 🧠 O que é o Fine-tuning nesse contexto?

O **fine-tuning**, no contexto desta aplicação, é o processo de **ajuste de um modelo de Inteligência Artificial (IA)** para que ele consiga dar **explicações personalizadas e pedagogicamente adequadas** ao corrigir as respostas dos alunos.

### Exemplo de aplicação do fine-tuning:

A IA utilizada na função `handleReviewQuestion()` foi treinada com um conjunto de dados reais da instituição, com padrões de correção e explicações detalhadas. Isso permite que o sistema retorne respostas como:

- ✅ **Por que a alternativa X está correta?**
- ✅ **O que o aluno errou ao escolher a alternativa Y?**
- ✅ **Dicas para acertar questões semelhantes no futuro**

---

## 💬 Como funciona a Assistente Virtual dentro da aplicação?

### Fluxo da IA no Quiz:

1. O aluno responde a questão e deseja revisar a correção.
2. O front chama o método:  
   `handleReviewQuestion(userAnswer)`
3. Este método faz uma **chamada assíncrona ao backend**, passando:
   - ID da atividade
   - ID do usuário (via AuthService)
   - ID do curso
   - ID da questão
4. O **backend consulta o modelo de IA (via API de Fine-tuning)**, executa a correção inteligente e devolve uma **explicação textual customizada**.
5. A aplicação exibe o texto de explicação na interface.

---

## 🎯 Padrões de Arquitetura Seguidos

- ✅ **SOLID Principles**  
Foco em responsabilidade única, injeção de dependência (services), e separação de lógica de cálculo (usando Strategy Pattern).

- ✅ **Strategy Pattern aplicado ao cálculo de Score**  
Fácil alterar futuramente a regra de cálculo (ex: adicionar peso por questão, aplicar bônus, etc).

---

## 📈 Extensões Futuras Possíveis

- Adicionar múltiplas estratégias de correção.
- Implementar diferentes estratégias de pontuação (parcial, tempo de resposta, etc.).
- Permitir revisão completa do quiz com feedback por pergunta.
- Adicionar gamificação com medalhas e conquistas baseadas no score.

---

## ✅ Requisitos de Integração

- Backend com suporte a endpoint de correção com IA.
- Serviço de autenticação funcionando (`AuthService`).
- Serviço de atividades implementado (`AtividadeService`).
