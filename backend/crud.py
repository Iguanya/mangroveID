# crud.py
from database import get_db_connection
import logging

logger = logging.getLogger(__name__)

def insert_scan(filename: str, file_path: str | None, predicted_class: str | None, confidence: float | None):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        sql = """
            INSERT INTO scans (filename, file_path, predicted_class, confidence, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """
        cursor.execute(sql, (filename, file_path, predicted_class, confidence))
        db.commit()
        scan_id = cursor.lastrowid
        return scan_id
    except Exception as e:
        db.rollback()
        logger.exception("DB insert failed")
        raise
    finally:
        cursor.close()
        db.close()

def list_scans():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT id, filename, file_path, predicted_class, confidence, created_at FROM scans ORDER BY id DESC")
        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "filename": r[1],
                "file_path": r[2],
                "predicted_class": r[3],
                "confidence": float(r[4]) if r[4] is not None else None,
                "created_at": r[5].strftime("%Y-%m-%d %H:%M:%S") if r[5] else None
            }
            for r in rows
        ]
    finally:
        cursor.close()
        db.close()
