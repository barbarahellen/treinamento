var Treinamento = Treinamento || {};

Treinamento.Validacao = {
    BloquearData: async function(executionContext) {
        var formContext = executionContext.getFormContext();
        var turmaId = formContext.data.entity.getId();

        if(!turmaId){
            console.warn("ID da turma não encontrado!");
            return;
        }
        turmaId = turmaId.replace("{", "").replace("}", ""); 

        var temNotasVazias = false;

        try{
            var resultados = await Xrm.WebApi.retrieveMultipleRecords(
                "minsait_historicodoaluno", 
                `?$filter=_minsait_turma_value eq ${turmaId}`
            );

            console.log("resultados encontrados: ", resultados.entities);

            resultados.entities.forEach(function(registro) {
                console.log("histórico: ", registro);
                console.log("nota: ", registro.minsait_nota)
                if (!registro.minsait_nota || registro.minsait_nota == null || registro.minsait_nota == "") {
                    temNotasVazias = true;                            
                }
            });

            if (temNotasVazias) {
                formContext.getAttribute("minsait_datadefim")?.setValue(null); 
                formContext.getControl("minsait_datadefim").setDisabled(true);     // desabilita o campo de "Data de Conclusão"
                formContext.getControl("minsait_datadefim").setNotification("Não é possível preencher a Data de Fim enquanto houver históricos sem nota!");
            } else {
                formContext.getControl("minsait_datadefim").setDisabled(false);    // habilita o campo de "Data de Conclusão"
                formContext.getControl("minsait_datadefim").clearNotification();
            }
        }catch(error){
            console.error("erro ao recuperar históricos: ", error);
        }
    }
};