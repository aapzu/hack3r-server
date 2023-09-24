# hack3r_server

A small project which helps debugging remote connections

```
hack3r-server

Starts a server to receive data from the hack

Options:
      --help              Show help                                    [boolean]
      --version           Show version number                          [boolean]
  -n, --networkInterface  The network interface to use
     [string] [choices: "lo0", "en0", ...]
  -p, --port              Port to run the server in     [number] [default: 3000]
  -l, --payload           Payload file (array, object or string) to serve
  -g, --ngrok             Use ngrok to expose the server               [boolean]
  -t, --ngrok-authtoken   ngrok authtoken                               [string]
  -s, --ngrok-subdomain   ngrok subdomain                               [string]
```

## Using

```shell
> npx hack3r-server [arguments...]
```

## Development

```shell
pnpm install
pnpm start
```
