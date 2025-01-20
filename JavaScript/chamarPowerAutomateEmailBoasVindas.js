async function chamarFluxoPowerAutomate(executionContext) {
    const formContext =
      typeof executionContext.getFormContext === "function"
        ? executionContext.getFormContext()
        : executionContext;
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
            <attribute name="contactid" />
            <attribute name="lastname" />
            <attribute name="firstname" />
            <attribute name="emailaddress1" />
            <order attribute="lastname" descending="false" />
            <link-entity name="minsait_turma_contact" from="contactid" to="contactid" visible="false" intersect="true">
                <link-entity name="minsait_turma" from="minsait_turmaid" to="minsait_turmaid" alias="ab">
                    <filter type="and">
                        <condition attribute="minsait_turmaid" operator="eq" uiname="001" uitype="minsait_turma" value="${entityIdFormatado}" />
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
        "https://prod-25.brazilsouth.logic.azure.com:443/workflows/d3786ac0d5e743a8a6c3955da216840e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2jOwkBg1Jqey-vHvFuduVGJZcXlQTkXGbwuSOWU3hpQ",
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
      if (responseData.success === true) {
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