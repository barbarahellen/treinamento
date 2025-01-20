async function chamarPowerAutomateEmailConclusao(executionContext) {
    const formContext =
      typeof executionContext.getFormContext === "function"
        ? executionContext.getFormContext()
        : executionContext;
    let data_fim = formContext.getAttribute("minsait_datadefim")?.getValue();

    if(!data_fim){
      alert("Por favor, preencha a data de fim antes de enviar o e-mail.");
      return;
    }

    let turma = formContext.getAttribute("minsait_Codigodaturma")?.getValue();
  
    const entityId = formContext.data.entity.getId();
    if (!entityId) {
      alert("Erro: Não foi possível obter o ID da entidade.");
      return;
    }
    Xrm.Utility.showProgressIndicator("Enviando emails...");
    const entityIdFormatado = entityId.replace(/[{}]/g, "");
  
    let contacts;
    try {
      const fetchXml = `
          <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
            <entity name="contact">
              <attribute name="contactid"/>
              <attribute name="lastname"/>
              <attribute name="firstname"/>
              <attribute name="emailaddress1"/>
              <order attribute="emailaddress1" descending="false"/>
              <link-entity name="minsait_turma_contact" from="contactid" to="contactid" visible="false" intersect="true">
                <link-entity name="minsait_turma" from="minsait_turmaid" to="minsait_turmaid" alias="aa">
                  <filter type="and">
                    <condition attribute="minsait_turmaid" operator="eq" uiname="001" uitype="minsait_turma" value="{B3B147D6-4ED0-EF11-8EE9-002248DF5FC3}"/>
                  </filter>
                </link-entity>
              </link-entity>
            </entity>
          </fetch>
      `;
  
      contacts = await Xrm.WebApi.online.retrieveMultipleRecords(
        "contact",
        `?fetchXml=${encodeURIComponent(fetchXml)}`
      );
    } catch (error) {
      alert(`Erro ao buscar contatos: ${error.message}`);
      return;
    }
  
    const data = {
      turma: turma,
      turmaId: entityIdFormatado,
      contatos: contacts.entities
        .filter(
          (contact) =>
            contact.firstname && contact.lastname && contact.emailaddress1
        ) 
        .map((contact) => ({
          nome: contact.firstname,
          sobrenome: contact.lastname,
          email: contact.emailaddress1,
        })),
    };
  
    if (data.length === 0) {
      alert("Nenhum contato relacionado encontrado.");
      return;
    }
  
    try {
      const response = await fetch(
        "https://prod-27.brazilsouth.logic.azure.com:443/workflows/bb2a2ec55e9b4b80b3ac5f572a7eb6ac/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=G-CXmDgNm_v0VudjZmmra3evd3Wb91KIYzUUP6AkfTE",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Erro na solicitação: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      if (responseData.success === "true") {
        alert(responseData.message);
      } else {
        alert(`Erro no Power Automate: ${responseData.message}`);
      }
    } catch (error) {
      alert(`Erro ao processar a solicitação: ${error.message}`);
    } finally {
      Xrm.Utility.closeProgressIndicator();
    }
  }