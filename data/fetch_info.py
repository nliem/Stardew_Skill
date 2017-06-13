from bs4 import BeautifulSoup
import copy
import urllib2

stardew_url = "http://stardewvalleywiki.com"
sample_json = 	\
	{
		"item" : "",
		"obtained" : "",
		"giftable" : False,
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
	response = urllib2.urlopen( full_url)
	items_page = response.read()
	soup = BeautifulSoup(items_page, 'html.parser')

	sub_categories = soup.find_all(id="mw-subcategories")
	pages = soup.find_all(id="mw-pages")

	print("subcategory")
	print(str(sub_categories))
	print("Pages")
	print(str(pages))

	page_urls =  get_urls(pages)
	sub_categories_urls = get_urls(sub_categories)
	print(page_urls)
	print(sub_categories_urls)

	#for page url scrape web 
	#for sub_categories recurse webscraper


def get_urls(content):
	output = []
	for p in content:
		soup = BeautifulSoup(str(p), 'html.parser')
		for a in soup.find_all("a", href=True):
			output.append(stardew_url + a["href"])
	return output


def scrape_pages(full_url):
	response = urllib2.urlopen(full_url)
	page = response.read()
	soup = BeautifulSoup(page, 'html.parser')
	gifting = soup.find(id="Gifting")
	#print(str(gifting))
	if gifting:
		json = copy.deepcopy(sample_json)
		json["gifting"] = True
		print("this page has gifting")


#web_scraper(stardew_url + "/Category:Items")
scrape_pages("http://stardewvalleywiki.com/Maple_Syrup")






