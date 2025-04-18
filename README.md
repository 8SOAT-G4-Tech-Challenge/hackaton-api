## FIAP Hackaton 8SOAT - Grupo 04 - Microserviço de solicitação e consulta de conversões de videos

## Objetivo

Este microserviço tem como objetivo disponibilizar uma API que recebe requisições de solicitações de conversões de videos em imagens e também a consulta do status de cada solicitação de conversão. 

Ele utiliza o recurso AWS S3 para armazenar os videos e também utiliza um banco relacional Postgres para armazenar informações das solicitações de conversões de videos. O serviço também utiliza a comunicação com o recurso de fila da AWS o SQS, onde cada solicitação é publicada na fila para que o microserviço de conversão possa realizar a conversão dos videos.

## Requerimentos
- Node 20 e Typescript;
- Docker e docker compose;
- Conta AWS Academy;
- AWS CLI;
- Acesso as configurações do repositório no Git Hub.

## Execução

Para realizar a execução local ou via cloud AWSm siga a seguinte documentação [Execução do serviço](./docs/RUN_CONFIGURATION.md) 

## Endpoints

Para consultar e requisitar os endpoints existentes nesse microserviço, acesse o repositório [hackaton-bruno](https://github.com/8SOAT-G4-Tech-Challenge/hackaton-bruno).

## Arquitetura do Sistema

Para saber mais detalhes sobre a arquitetura do sistema que esse serviço faz parte acesse a documentação [Arquitetura do Sistema](./docs/SYSTEM_ARCHITECTURE.md)

## Participantes

- Amanda Maschio - RM 357734
- Jackson Antunes - RM357311
- Lucas Accurcio - RM 357142
- Vanessa Freitas - RM 357999
- Winderson Santos - RM 357315
