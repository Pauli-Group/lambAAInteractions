
The first UserOperation must send ~0.1 Eth (sepolia) to the entry point. This deposits the amount into the entrypoint. These funds are withdrawn from by the bundler who submits your user operation to the chain. 

An alternatve is to deposit manually using etherscan and metamask. This method is not recommended as it adds more complexity for new users who may be comming from a centralized exchange.


## TODO: 

- [ ] Add 'of' method to lamportwalletmanager/Monad and replace our local definition of 'Monad' with the one defined in lamportwalletmanager
- [ ] Make 'deposit' use 'sendEth' to reduce code duplication