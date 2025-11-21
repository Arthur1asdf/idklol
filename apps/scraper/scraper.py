import requests
from urllib.parse import urljoin
from urllib.robotparser import RobotFileParser


def print_robots(url: str):
    robots_txt_url = urljoin(url, "/robots.txt")
    response = requests.get(robots_txt_url)
    if response.status_code == 200:
        print("robots.txt found:\n")
        print(response.text)
    else:
        print("No robots.txt found.")


def is_url_allowed(target_url: str, user_agent: str = "*") -> bool:
    robots_txt_url = urljoin(target_url, "/robots.txt")
    response = requests.get(robots_txt_url)
    

if __name__ == "__main__":
    test_url = "https://ibmglobal.avature.net/en_US/careers/JobDetail?jobId=59668&source=SN_LinkedIn"

    # print_robots(test_url) this just prints the entire robots
    allowed_to_scrape = is_url_allowed(test_url)
    print(allowed_to_scrape)
    
