using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace TreinamentoPlugins
{
    public class ContatoPreOperationCreateSync : IPlugin          // declaração da classe
    {
        public void Execute(IServiceProvider serviceProvider)     // método da classe
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var crmService = serviceFactory.CreateOrganizationService(context.UserId);
            var trace = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            trace.Trace("Início Plugin");

            if(context.MessageName.ToLower() == "create"
                && context.Mode == Convert.ToInt32(MeuEnum.Mode.Synchronous)
                && context.Stage == Convert.ToInt32(MeuEnum.Stage.PreOperation)
                )
            {
                Entity entidadeContexto = null;

                if (context.InputParameters.Contains("Target"))
                    entidadeContexto = (Entity)context.InputParameters["Target"];

                if(entidadeContexto != null)
                {
                    trace.Trace("contexto diferente de nulo. ");

                    if (entidadeContexto.Attributes.ContainsKey("minsait_cpf"))
                    {
                        var cpfContexto = entidadeContexto.Attributes["minsait_cpf"].ToString();
                        
                        trace.Trace($"CPF do contexto: {cpfContexto}");

                        QueryExpression queryExpression = new QueryExpression("contact");

                        // colar query - filtrar os contatos pelo CPF

                        // Instantiate QueryExpression query
                        queryExpression.TopCount = 1;

                        // Add all columns to query.ColumnSet
                        queryExpression.ColumnSet.AddColumn("minsait_cpf");

                        // Add conditions to query.Criteria
                        queryExpression.Criteria.AddCondition("minsait_cpf", ConditionOperator.Equal, cpfContexto);


                        var colecaoEntidades = crmService.RetrieveMultiple(queryExpression);
                        if (colecaoEntidades.Entities.Count > 0)
                            throw new InvalidPluginExecutionException("CPF já cadastrado!");
                    }
                }
            }

            trace.Trace("Fim Plugin");
        }
    }
}
