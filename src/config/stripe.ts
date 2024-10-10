import Stripe from "stripe";

const secret =
	"sk_test_51PsJJHJd4iIFhMZIUmmBOrFZIqpy50NO2WEYK5DZ7sjTHIDZnsJn2WHhMjb1o9IuE1LGp4UBurgcfwzsBezHAOv600v7D7cf5Q";

const stripe = new Stripe(secret, {
	apiVersion: "2024-06-20",
});

export default stripe;
