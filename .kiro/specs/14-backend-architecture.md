# GhostPipes Backend - Project Overview

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Fastify 5+
- **Database**: Amazon Aurora PostgreSQL (to impress AWS judges)
- **ORM/Query Builder**: Knex.js 3.1+
- **Auth**: @fastify/jwt 9+
- **Web Push**: @block65/webcrypto-web-push 2+
- **Deployment**: AWS App Runner

## Architecture Pattern

Domain-driven modular plugins:

- Each module = routes + schemas + handlers + services
- Separation of concerns
- Easy to test and maintain

## Key Features

1. User authentication (signup/login/logout)
2. Pipeline CRUD with auto-sync from extension
3. Webhook endpoints for third-party integrations
4. Web Push notifications to extension service worker
5. Pipeline sharing and cloning
6. AWS services integration

## Naming Conventions

- **JavaScript**: camelCase (userId, pipelineId, webhookUrl)
- **Database**: snake_case (user_id, pipeline_id, webhook_url)
- **Files**: kebab-case (auth-service.js, pipeline-routes.js)

## Database Strategy

Use Amazon Aurora PostgreSQL Serverless v2 for:

- Auto-scaling
- High availability
- AWS integration
- Cost-effective for hackathon

## Core Modules

1. **auth**: User registration, login, JWT tokens
2. **pipelines**: CRUD operations, sync, share/clone
3. **webhooks**: Receive HTTP requests, trigger push notifications
4. **push**: Web Push subscription management and delivery

## Extension Integration Points

1. Auth dialog (400-500px centered modal)
2. Auto-sync every 10-20 seconds if user logged in
3. Service worker listens for Web Push messages
4. IndexedDB sync strategy
