import requests
import json


cotacoes = requests.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL').json()

cotacao_dolar = cotacoes['USDBRL']['bid']
cotacao_bitcoin = cotacoes['BTCBRL']['bid']
cotacao_euro = cotacoes['EURBRL']['bid']


while True:
	print('''Segue lista de moedas a serem verificadas:
		[1] - Dolar
		[2] - Bitcoin
		[3] - Euro
		[4] - Sair''')

	resp = int(input('Qual moeda quer saber? (Digite um número) '))
	if resp == 1:
	    	resultado = cotacoes['USDBRL']
	    	moeda = cotacoes['USDBRL']['name']
	elif resp == 2:
	    	resultado = cotacoes['BTCBRL']
	    	moeda = cotacoes['BTCBRL']['name']
	elif resp == 3:
		resultado = cotacoes['EURBRL']
		moeda = cotacoes['EURBRL']['name']
	elif resp == 4:
		print('Saindo...')
		break

	print(f"Segue dados da moeda \033[1m{moeda}\033[0m: ")
	print(40 * '-')
	for k, v in resultado.items():
	    print(f'{k}: {v}')
	print(40 * '-')

