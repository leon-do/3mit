# EVM Emit 

Emit EVM all events

## Setup

`npm install`

`cp .env.example .env`

Update `.env` file

```
RPC_URL=wss://goerli.infura.io/ws/v3/<API_KEY>
```

`npm run dev`

Emmited event:

```json
{
  "contractAddress": "0x94997FD828703996C1577Fab6B98AbFEd3c36734",
  "transactionHash": "0x5ed7599ec9e787ad266ce8c180eba821dc9ba0246fa83bb2c1cebf1beb3d0cd5",
  "eventHash": "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
  "args": ["0x000000000000000000000000f0cb35c738ee096c6eae3b58b98380f08cb4aea2", "0x000000000000000000000000590b95fa78c8e8b9139a2dfd292ed0770d584e45"],
  "data": "0x0000000000000000000000000000000000000000000000056bc75e2d63100000"
}
```



https://user-images.githubusercontent.com/19412160/212821216-8eb6603c-7318-493e-b437-b67aeb3e326f.mov
