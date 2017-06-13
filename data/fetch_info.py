from bs4 import BeautifulSoup
import copy
import urllib2
import re
import requests
import json

stardew_url = "http://stardewvalleywiki.com"
sample_json = 	\
	{
		"item" : "",
		"obtained" : "",
		"giftable" : "false",
		"preference" : {
			"Abigail" : "",
			"Alex" : "",
			"Caroline" : "",
			"Clint" : "",
			"Demetrius" : "",
			"Dwarf" : "",
			"Elliott" : "",
			"Emily" : "",
			"Evelyn" : "",
			"George" : "",
			"Gus" : "",
			"Haley" : "",
			"Harvey" : "",
			"Jas" : "",
			"Jodi" : "",
			"Kent" : "",
			"Krobus" : "",
			"Leah" : "",
			"Lewis" : "",
			"Linus" : "",
			"Marnie" : "",
			"Maru" : "",
			"Pam" : "",
			"Penny" : "",
			"Pierre" : "",
			"Robin": "",
			"Sam" : "",
			"Sandy" : "",
			"Sebastian" : "",
			"Shane" : "",
			"Vincent" : "",
			"Willy" : "",
			"Wizard" : ""
		}
	}
json_objects = []



def web_scraper(full_url):
	response = requests.get(full_url)
	page = response.content
	soup = BeautifulSoup(page, 'html.parser')

	sub_categories = soup.find_all(id="mw-subcategories")
	pages = soup.find_all(id="mw-pages")

	##print("subcategory")
	##print(str(sub_categories))
	##print("Pages")
	##print(str(pages))

	page_urls =  get_urls(pages)
	sub_categories_urls = get_urls(sub_categories)

	for p in page_urls:
		#print(p)
		json_obj = scrape_pages(p)
		if json_obj is not None:
			print(json.dumps(json_obj) +",")
			json_objects.append(json.dumps(json_obj))

	for s in sub_categories_urls:
		web_scraper(s)

	#for page url scrape web 
	#for sub_categories recurse webscraper


def get_urls(content):
	output = []
	for p in content:
		soup = BeautifulSoup(str(p), 'html.parser')
		for a in soup.find_all("a", href=True):
			output.append(stardew_url + a["href"])
	return output


def remove_tags(html):
	return re.sub("<.*?>", "", html)  

def remove_strange_charactes(text):
	return re.sub("[^a-zA-z ]*", "", text)

def get_obtained(list_content):
	output = ""
	for i in range(2,len(list_content)):
		test = list_content[i]
		#print("1"+ str(test) + "2")

		soup = BeautifulSoup(str(test), 'html.parser')
		if(test=="\n" or "mw-headline" in str(test) or "h2" in str(test) or "wikitable" in str(test)):
			break
		else:
			modified = re.sub('\n', "", str(list_content[i]))
			modified = re.sub('"',"" , str(modified))
			output = output + modified
	return remove_tags(output)


def scrape_pages(full_url):
	response = requests.get(full_url)
	page = response.content

	soup = BeautifulSoup(page, 'html.parser')
	##print str(page)
	
	##print(str(gifting))
	infoboxtable = soup.find(id="infoboxtable")
	if infoboxtable:

		json = copy.deepcopy(sample_json)
		

		title = remove_tags(str(soup.find(id="firstHeading")))
		json["item"] = title
		content = soup.find(id="mw-content-text")
		soup = BeautifulSoup(str(content), 'html.parser')
		##print soup.find_all("p")
		obtained =get_obtained(content.contents)
		#print(obtained)
		json["obtained"] = obtained
		


		gifting = soup.find(id="Gifting")
		if gifting:
			json["giftable"] = "true"
			##print(obtained)
			table = soup.find("table", id="roundedborder")
			##print(table)
			##print "wtf?"
			table = remove_strange_charactes(remove_tags(str(table)))
			process_villager_table(table,json)
		else:
			json["giftable"] = "false"
		return json


def process_villager_table(table, json):
	#replace the title
	table = re.sub(" Villager Reactions","", table)
	reactions = ["Love","Like",	"Neutral","Dislike","Hate"]
	for reaction in reactions:
		table = re.sub(reaction," "+reaction, table)

	table = table[1:].split(" ")
	##print(table)
	reaction_insert_to = ""
	for item in table:
		if item in reactions:
			reaction_insert_to = item
			##print item
		else:
			if item in json['preference']:
				json['preference'][item] = reaction_insert_to
	

web_scraper(stardew_url + "/Category:Items")

#scrape_pages("http://stardewvalleywiki.com/Tub_o%27_Flowers")






