import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { SwnApiGateway } from './apigateway';
import { SwnDatabase } from './database';
import { SwnEventBus } from './eventbus';
import { SwnMicroservices } from './microservice';
import { SwnQueue } from './sqs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, 'Database')

    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    })

    const apigateway = new SwnApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice,
      orderMicroservice: microservices.orderMicroservice
    })

    const queue = new SwnQueue(this, 'Queue', {
      consumer: microservices.orderMicroservice
    })

    const eventbus = new SwnEventBus(this, 'EventBus', {
      publisherFunction: microservices.basketMicroservice,
      // targetFunction: microservices.orderMicroservice
      targetQueue: queue.orderQueue
    })

  }
}
