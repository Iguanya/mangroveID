import mysql.connector

def get_db_connection():
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root_root",
        database="scans_db"
    )
    return db
