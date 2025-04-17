# Execução do serviço

## Execução local

1. Certifique-se de ter cumprido com os pré-requisitos;

2. Acesse o diretório raiz do projeto e execute o comando:

```sh
docker-compose up
```

3. Após a finalização da execução as APIs poderão ser requisitadas pela url `http://localhost:3334/...`

## Execução cloud AWS

A execução via cloud AWS consiste na utilização do ambiente da AWS Academy e os passos a seguir levam em consideração que a execução acontece nesse ambiente da AWS.

1. Certifique-se de executar primeiramente a configuração e provisionamento da infraestrutura antes de executar os próximos passos. A configuração pode ser consultada na documentação de execução da infraestrutura do repositório [hackaton-terraform](https://github.com/8SOAT-G4-Tech-Challenge/hackaton-terraform/blob/master/docs/RUN_CONFIGURATION.md);

2. Acesse o menu `Actions` do repositório no GitHub, clique no botão New workflow e execute manualmente a ação de deploy. Essa fará o deploy do microserviço no recurso EKS da AWS Academy.

3. Acesse o recurso Api Gateway dentro na AWS Academy e copie a url de acesso e requisite as APIs utilizando `<url-api-gateway>/files/...`.