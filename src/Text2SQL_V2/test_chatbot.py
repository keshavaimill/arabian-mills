from src.Text2SQL_V2.chatbot_api import run_chatbot_query

def test(question: str):
    print("\n" + "=" * 80)
    print("QUESTION:", question)
    print("=" * 80)

    result = run_chatbot_query(question)

    print("\nGenerated SQL:")
    print(result["sql"])

    print("\nSummary:")
    print(result["summary"])

    print("\nRows returned:", len(result["data"]))

    if result["viz"]:
        print("\n✅ Visualization generated")
        print("Mime type:", result["mime"])
        print("Viz length (base64 chars):", len(result["viz"]))
    else:
        print("\n❌ No visualization")

    print("=" * 80)


if __name__ == "__main__":
    # Basic tests
    test("Show current stock for all finished goods")

    test("What are total sales by SKU?")

    test("Show production plan quantities by date")

    # Visualization tests
    test("Show sales trend over time")

    test("Plot forecast 30 day stock balance")

    test("Compare current stock units by category")
