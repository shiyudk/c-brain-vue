CREATE TABLE IF NOT EXISTS leadership_tasks (
    team_name TEXT PRIMARY KEY,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE leadership_tasks ENABLE ROW LEVEL SECURITY;

-- 모든 요청 허용 (관리자 기능이므로 보안 설정 필요시 추후 고도화)
CREATE POLICY "Enable all access for now" ON leadership_tasks FOR ALL USING (true) WITH CHECK (true);
