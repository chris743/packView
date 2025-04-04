import json

def parse_sizer_line(line):
    return {
        "pool_id": line[0:12].strip(),
        "block_id": line[12:24].strip(),
        "lot_id": line[24:36].strip(),
        "run": line[36:45].strip(),
        "description": line[45:85].strip(),
        "packout_date": line[85:95].strip(),
        "product_id": line[95:111].strip(),
        "quantity": int(line[111:120].strip() or 0)
    }

def load_sizer_batch_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        print(lines)
        lines = list(parse_sizer_line(line) for line in lines if line.strip())
    
    return lines


