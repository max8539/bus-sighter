Sample bus data, to be saved in a file named buses.json:
```json
{
    "buses": [
        {
            "plate": "mo8380",
            "fleetnum": "8380",
            "opcode": "TSA6",
            "depot": "Leichhardt",
            "chassis": "BYD D9RA",
            "body": "Gemilang ECO",
            "year": 2021
        },
        {
            "plate": "mo8200",
            "fleetnum": "8200",
            "opcode": "INTL",
            "depot": "Leppington",
            "chassis": "Yutong E12",
            "body": "Yutong E12",
            "year": 2021
        }
    ]
}
```

Sample operator data:
```json
{
    "operators": [
        {
            "opcode": "TSA6",
            "name": "Transit Systems Inner West",
            "depots": ["Burwood","Leichhardt","Kingsgrove","Tempe"],
            "routes": ["308","320","348","358","389","401"] // etc...
        },
        {
            "opcode": "INTL",
            "name": "Interline Bus Service",
            "depots": ["Leppington","Macquarie Fields"],
            "routes": ["840","850","851","852","853","854"] // etc...
        }
    ]
}
```