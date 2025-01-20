# 📚 Projeto de Gestão de Cursos  

### 💡 O que foi feito em aula:

* Tabela Contato:
    * Adição dos campos “É instrutor?” e “CPF”.
    * Implementação de validação e máscara de CPF em JavaScript.
    * Regras de visibilidade e obrigatoriedade:
    * Se "É instrutor?" = Sim, o CPF torna-se obrigatório.
* Tabela Curso: Adicionados os campos: nome do curso e duração.
* Tabela Turma:
  * Campos adicionados: Instituição (Conta), Curso, Professor, número de alunos, Turno, Data de início e Data de conclusão.
  * Botão para e-mail de boas-vindas: Disponível para enviar uma mensagem aos alunos ao criar uma turma.
* Plugin: Validação para garantir que o CPF não esteja duplicado ao criar ou atualizar um contato.

### 🛠️ O que foi necessário adicionar no projeto:

- Tabela **Histórico do Aluno**: Criar tabela com os campos: Turma, Aluno, Nota (tipo decimal), Situação (Aprovado, Reprovado ou Em Andamento, sendo "Em Andamento" o valor padrão).
- Tabela Aluno: Permitir visualizar o histórico do aluno selecionado na guia resumo.
- Validação da Data de Conclusão da Turma: Bloquear preenchimento da data de conclusão caso algum histórico não tenha nota.
- Ação de Conclusão de Curso: Adicionar botão para enviar e-mail de parabéns aos alunos quando a data de conclusão for preenchida.
- Atualização da Situação no Histórico: Alterar a situação automaticamente ao atualizar a nota: Nota ≥ 7: Situação = Aprovado.  Nota < 7: Situação = Reprovado.
- Massa de dados
