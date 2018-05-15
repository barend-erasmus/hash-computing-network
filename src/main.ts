import { MessageQueueClient } from 'wsmq';

function onMessage(channel: string, data: any, mqc: MessageQueueClient): void {

}

const messageQueueClient: MessageQueueClient = new MessageQueueClient('ws://wsmq.openservices.co.za', onMessage, [
    'hash-computing-network',
]);

messageQueueClient.connect();
