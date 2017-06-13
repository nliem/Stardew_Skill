from bs4 import BeautifulSoup
import urllib2

stardew_url = "http://stardewvalleywiki.com/"
response = urllib2.urlopen('http://stardewvalleywiki.com/Category:Items')
items_page = response.read()
soup = BeautifulSoup(items_page, 'html.parser')
sub_categories = soup.find_all(id="mw-subcategories")
pages = soup.find_all(id="mw-pages")


print("subcategory")
print(str(sub_categories))
print("Pages")
print(str(pages))
#urls=[]

#category_urls = []
#for category in categories:
#	print(categories)
#	soup = BeautifulSoup(str(category), 'html.parser')
#	for a in soup.find_all("a", href=True):
#		category_urls.append(a["href"])



