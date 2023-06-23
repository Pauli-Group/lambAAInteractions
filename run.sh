# create an account called william
npx tsc ; node lib/Main.js create-account sepolia william

# send 2 wei from will to 0xd90f7
npx tsc ; node lib/Main.js send-eth will 0xd90f7Fb941829CFE7Fc50eD235d1Efac05c58190 2

# send 2 wei from will to 0xd90f7 using pull payments
npx tsc ; node lib/Main.js send-eth-async will 0xd90f7Fb941829CFE7Fc50eD235d1Efac05c58190 2

# show account details
npx tsc ; node lib/Main.js show will

# add keys to account
npx tsc ; node lib/Main.js add-keys will 

# create and submit a User Operation where `calldata` is provided by the file `calldata/senddemo`
npx tsc ; node lib/Main.js execute will calldata/senddemo