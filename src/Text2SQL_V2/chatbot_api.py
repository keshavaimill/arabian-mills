# import json, os
# from Text2SQL_V2.core.db_builder import build_database, execute_sql
# from Text2SQL_V2.core.schema_loader import SchemaLoader
# from Text2SQL_V2.agents.text2sql_agent import Text2SQLAgent
# from Text2SQL_V2.agents.summarizer_agent import SummarizerAgent
# from Text2SQL_V2.utils.intent import wants_chart
# from Text2SQL_V2.utils.persist import persist_order_log
# import os
# from Text2SQL_V2.mailer import send_success_email
# from Text2SQL_V2.summary_generator import generate_llm_summary
# import logging
# import matplotlib
# matplotlib.use("Agg")  # ✅ MUST be before pyplot

# import matplotlib.pyplot as plt


# def setup_logger():
#     """
#     Sets up a logger with a console handler.
#     """
#     # Create a logger
#     logger = logging.getLogger(__name__)
#     logger.setLevel(logging.DEBUG)  # Set minimum log level

#     # Prevent adding multiple handlers if setup_logger is called multiple times
#     if not logger.handlers:
#         # Create console handler
#         console_handler = logging.StreamHandler()
#         console_handler.setLevel(logging.DEBUG)  # Handler log level

#         # Create formatter for log messages
#         formatter = logging.Formatter(
#             '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
#         )
#         console_handler.setFormatter(formatter)

#         # Add handler to logger
#         logger.addHandler(console_handler)

#     return logger
# logger = setup_logger()


# # Absolute path of chatbot_api.py
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# # Go UP: Text2SQL_V2 → src
# SRC_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

# # Data folder inside src
# DATA_DIR = os.path.join(SRC_DIR, "data")

# schema = [
#     {
#         "table_name": "finished_goods_inventory",
#         "path": os.path.join(DATA_DIR, "finished_goods_inventory.csv"),
#     },
#     {
#         "table_name": "sales_history",
#         "path": os.path.join(DATA_DIR, "sales_history.csv"),
#     },
#     {
#         "table_name": "production_plan",
#         "path": os.path.join(DATA_DIR, "production_plan.csv"),
#     },
#     {
#         "table_name": "inventory_forecast",
#         "path": os.path.join(DATA_DIR, "inventory-forecast.csv"),
#     },
#     {
#         "table_name": "login_credentials",
#         "path": os.path.join(DATA_DIR, "LoginCredentials.csv"),
#     },
# ]




# # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # DATASETS_DIR = os.path.join(BASE_DIR, "datasets")

# # schema = [
# #     {
# #         "table_name": "sku_daily_forecast",
# #         "path": os.path.join(DATASETS_DIR, "sku_daily_forecast.csv")
# #     },
# #     {
# #         "table_name": "order_log",
# #         "path": os.path.join(DATASETS_DIR, "order_log.csv")
# #     },
# #     {
# #         "table_name": "sku_daily_sales",
# #         "path": os.path.join(DATASETS_DIR, "sku_daily_sales.csv")
# #     },
# #     {
# #         "table_name": "raw_material_inventory",
# #         "path": os.path.join(DATASETS_DIR, "raw_material_inventory.csv")
# #     },
# # ]

# schema_loader = SchemaLoader(schema)
# loaded_schema = schema_loader.load()

# db_path = os.path.join(BASE_DIR, "chatbot.db")
# build_database(schema, db_path)

# with open(os.path.join(BASE_DIR, "schema_metadata.json")) as f:
#     schema_metadata = json.load(f)

# t2s = Text2SQLAgent(db_path, loaded_schema, schema_metadata)
# summarizer = SummarizerAgent()


# def run_chatbot_query(question: str):
#     sql = t2s.run(question)
#     result = execute_sql(db_path, sql)

#     # ==================================================
#     # WRITE operations handling (INSERT / UPDATE / DELETE)
#     # ==================================================
#     if isinstance(result, int):
#         rows_affected = result

#         # Detect operation type
#         sql_lower = sql.lower().strip()
#         if sql_lower.startswith("insert"):
#             operation = "INSERT"
#             action_verb = "inserted"
#         elif sql_lower.startswith("update"):
#             operation = "UPDATE"
#             action_verb = "updated"
#         elif sql_lower.startswith("delete"):
#             operation = "DELETE"
#             action_verb = "deleted"
#         else:
#             operation = "UNKNOWN"
#             action_verb = "modified"

#         # Detect target table
#         table = (
#             "raw_material_log"
#             if "raw_material_log" in sql.lower()
#             else "order_log"
#         )

#         # --------------------
#         # Generate LLM email summary (MANDATORY - retry until success)
#         # --------------------
#         email_content = None
#         summary_retries = 3
        
#         for summary_attempt in range(1, summary_retries + 1):
#             try:
#                 logger.info(f"📧 Generating email summary (attempt {summary_attempt}/{summary_retries})...")
#                 email_content = generate_llm_summary(
#                     sql_query=sql,
#                     row_count=rows_affected
#                 )
                
#                 # Validate that email_content is a dict with required keys
#                 if not isinstance(email_content, dict):
#                     raise ValueError(f"Invalid email_content type: {type(email_content)}, expected dict")
                
#                 if "subject" not in email_content or "body" not in email_content:
#                     raise ValueError(f"Missing required keys in email_content. Got: {list(email_content.keys())}")
                
#                 if not email_content.get("subject") or not email_content.get("body"):
#                     raise ValueError("Empty subject or body in email_content")
                
#                 logger.info("✅ Email summary generated successfully")
#                 break  # Success - exit retry loop
                
#             except Exception as e:
#                 logger.warning(f"⚠️ Email summary generation attempt {summary_attempt}/{summary_retries} failed: {str(e)}")
#                 if summary_attempt < summary_retries:
#                     import time
#                     time.sleep(1)  # Brief delay before retry
#                     continue
#                 else:
#                     # All retries exhausted - summary generation is mandatory
#                     logger.error(f"❌ Email summary generation failed after {summary_retries} attempts. Email will NOT be sent.")
#                     logger.error(f"   Last error: {type(e).__name__}: {e}")
#                     email_content = None

#         # --------------------
#         # Persist correct CSV (for INSERT/UPDATE/DELETE)
#         # --------------------
#         try:
#             persist_order_log(db_path, table)
#             logger.info(f"✅ {table} persisted successfully")
#         except Exception as e:
#             logger.warning(f"Failed to persist {table}: {str(e)}")

#         # --------------------
#         # Send success email (ONLY if summary was generated successfully)
#         # --------------------
#         if email_content:
#             try:
#                 email_sent = send_success_email(
#                     subject=email_content["subject"],
#                     body=email_content["body"]
#                 )
#                 if email_sent:
#                     logger.info("✅ Success email sent")
#                 else:
#                     logger.error("❌ Email sending failed - check mailer logs for details")
#             except Exception as e:
#                 logger.error(f"❌ Failed to send email: {str(e)}", exc_info=True)
#         else:
#             logger.error("❌ Email NOT sent - summary generation failed and is mandatory")

#         return {
#             "sql": sql,
#             "summary": f"✅ Successfully {action_verb} {rows_affected} record(s) in {table}.",
#             "rows_affected": rows_affected,
#             "operation": operation,
#             "email_subject": email_content["subject"] if email_content else None,
#             "email_body": email_content["body"] if email_content else None,
#             "data": [],
#             "viz": None,
#             "mime": None
#         }

#     # ==================================================
#     # SELECT handling
#     # ==================================================
#     df = result

#     # ---------- Summary ----------
#     if df.empty:
#         summary = f"No data found for your query: '{question}'."
#         data = []
#     else:
#         try:
#             summary = summarizer.summarize(question, df)
#         except Exception as e:
#             logger.warning(f"Summarization failed: {str(e)}")
#             summary = f"Query returned {len(df)} row(s)."

#         data = df.to_dict(orient="records")

#     # ---------- Visualization (Step 4) ----------
#     viz, mime = None, None
#     if wants_chart(question) and not df.empty:
#         try:
#             logger.info(f"Generating visualization for: {question}")
#             viz, mime = summarizer.generate_viz(question, df)
#             logger.info("✅ Visualization generated successfully")
#         except Exception as e:
#             logger.warning(f"Visualization generation failed: {str(e)}")
#             viz, mime = None, None

#     return {
#         "sql": sql,
#         "summary": summary,
#         "data": data,
#         "viz": viz,
#         "mime": mime
#     }





















import json
import os
import logging
import matplotlib

matplotlib.use("Agg")  # MUST be before pyplot
import matplotlib.pyplot as plt

from src.Text2SQL_V2.core.db_builder import build_database, execute_sql
from src.Text2SQL_V2.core.schema_loader import SchemaLoader
from src.Text2SQL_V2.agents.text2sql_agent import Text2SQLAgent
from src.Text2SQL_V2.agents.summarizer_agent import SummarizerAgent
from src.Text2SQL_V2.utils.intent import wants_chart



# =====================================================
# Logger setup
# =====================================================
def setup_logger():
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logger()


# =====================================================
# Path configuration
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Go UP: Text2SQL_V2 → src
SRC_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

# Data folder inside src
DATA_DIR = os.path.join(SRC_DIR, "data")


# =====================================================
# Dataset schema (READ-ONLY)
# =====================================================
schema = [
    {
        "table_name": "finished_goods_inventory",
        "path": os.path.join(DATA_DIR, "finished_goods_inventory.csv"),
    },
    {
        "table_name": "sales_history",
        "path": os.path.join(DATA_DIR, "sales_history.csv"),
    },
    {
        "table_name": "production_plan",
        "path": os.path.join(DATA_DIR, "production_plan.csv"),
    },
    {
        "table_name": "inventory_forecast",
        "path": os.path.join(DATA_DIR, "inventory-forecast.csv"),
    },
]


# =====================================================
# Load schema and build database
# =====================================================
schema_loader = SchemaLoader(schema)
loaded_schema = schema_loader.load()

db_path = os.path.join(BASE_DIR, "chatbot.db")
build_database(schema, db_path)

with open(os.path.join(BASE_DIR, "schema_metadata.json")) as f:
    schema_metadata = json.load(f)

t2s = Text2SQLAgent(db_path, loaded_schema, schema_metadata)
summarizer = SummarizerAgent()


# =====================================================
# Main chatbot entry
# =====================================================
def run_chatbot_query(question: str):
    """
    Handles ONLY SELECT-based analytical queries.
    No INSERT / UPDATE / DELETE operations are allowed.
    """

    logger.info(f"User question: {question}")

    sql = t2s.run(question)
    logger.info(f"Generated SQL: {sql}")

    df = execute_sql(db_path, sql)

    # ==================================================
    # Summary handling
    # ==================================================
    if df.empty:
        summary = f"No data found for your query: '{question}'."
        data = []
    else:
        try:
            summary = summarizer.summarize(question, df)
        except Exception as e:
            logger.warning(f"Summarization failed: {str(e)}")
            summary = f"Query returned {len(df)} row(s)."

        data = df.to_dict(orient="records")

    # ==================================================
    # Visualization handling
    # ==================================================
    viz, mime = None, None
    if wants_chart(question) and not df.empty:
        try:
            logger.info("Generating visualization...")
            viz, mime = summarizer.generate_viz(question, df)
            logger.info("Visualization generated successfully")
        except Exception as e:
            logger.warning(f"Visualization failed: {str(e)}")

    return {
        "sql": sql,
        "summary": summary,
        "data": data,
        "viz": viz,
        "mime": mime,
    }
